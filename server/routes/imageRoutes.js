// const express = require('express');
// const multer = require('multer');
// const sharp = require('sharp');
// const path = require('path');
// const fs = require('fs');

// const router = express.Router();

// // Configure multer for image uploads
// const storage = multer.memoryStorage();
// const upload = multer({ 
//   storage,
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
//   fileFilter: (req, file, cb) => {
//     if (file.mimetype.startsWith('image/')) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only image files are allowed'));
//     }
//   }
// });

// // Image compression endpoint
// router.post('/compress-image', upload.single('image'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No image file provided' });
//     }

//     const quality = parseInt(req.body.quality) || 80;
//     const { buffer, mimetype } = req.file;

//     let compressedBuffer;
    
//     if (mimetype === 'image/png') {
//       compressedBuffer = await sharp(buffer)
//         .png({ quality: Math.round(quality * 0.9) })
//         .toBuffer();
//     } else if (mimetype === 'image/gif') {
//       // For GIF, we'll convert to PNG with compression
//       compressedBuffer = await sharp(buffer)
//         .png({ quality: Math.round(quality * 0.9) })
//         .toBuffer();
//     } else {
//       // Default to JPEG compression
//       compressedBuffer = await sharp(buffer)
//         .jpeg({ quality })
//         .toBuffer();
//     }

//     res.set({
//       'Content-Type': mimetype,
//       'Content-Disposition': 'attachment; filename="compressed_image"'
//     });

//     res.send(compressedBuffer);
//   } catch (error) {
//     console.error('Image compression error:', error);
//     res.status(500).json({ error: 'Failed to compress image' });
//   }
// });

// module.exports = router;


const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Configure multer for image uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Increased to 20MB limit for larger images
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Helper function to determine output format and options for sharp
function getSharpOutputOptions(mimetype, targetFormat, quality) {
  let format = targetFormat;
  let effectiveMimeType = mimetype; // Store original mimetype for potential fallback

  if (format === 'original') {
    // Determine format based on original mimetype
    if (mimetype.includes('jpeg')) format = 'jpeg';
    else if (mimetype.includes('png')) format = 'png';
    else if (mimetype.includes('gif')) {
      format = 'png'; // Convert GIF to PNG for better compression with Sharp
      effectiveMimeType = 'image/png'; // Update effective mimetype for header
    }
    else if (mimetype.includes('webp')) format = 'webp';
    else {
      format = 'jpeg'; // Fallback to JPEG if original format is not explicitly handled
      effectiveMimeType = 'image/jpeg';
    }
  }

  const options = {};
  if (format === 'jpeg') {
    options.quality = quality;
    options.mozjpeg = true; // Use mozjpeg for better JPEG compression
  } else if (format === 'png') {
    options.quality = Math.round(quality * 0.9); // PNG quality is slightly different scale
    options.compressionLevel = Math.round(quality / 10); // 0-9
  } else if (format === 'webp') {
    options.quality = quality;
  }

  return { format, options, effectiveMimeType };
}

// Image compression endpoint
router.post('/compress-image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const { buffer, mimetype } = req.file;
    const {
      quality: reqQuality,
      targetSizeKB,
      targetFormat,
      targetWidth,
      targetHeight,
      compressionMethod
    } = req.body;

    let sharpInstance = sharp(buffer);

    // Apply resizing if dimensions are provided
    const width = targetWidth ? parseInt(targetWidth) : null;
    const height = targetHeight ? parseInt(targetHeight) : null;

    if (width || height) {
      sharpInstance = sharpInstance.resize(width, height, {
        fit: sharp.fit.inside, // Ensures image fits within dimensions without cropping
        withoutEnlargement: true // Prevents enlarging if image is smaller than target
      });
    }

    let compressedBuffer;
    const initialQuality = parseInt(reqQuality) || 80;
    const targetBytes = targetSizeKB ? parseInt(targetSizeKB) * 1024 : null;

    // Determine output format and options based on request
    let { format: outputFormat, options: outputOptions, effectiveMimeType } = getSharpOutputOptions(
      mimetype,
      targetFormat,
      initialQuality
    );

    if (compressionMethod === 'size' && targetBytes !== null) {
      // Iterative compression for target size
      let currentQuality = 90; // Start with high quality for size-based compression
      const minQuality = 10;
      const maxIterations = 20; // Prevent infinite loops
      let smallestBuffer = null;
      let smallestSize = Infinity;

      for (let i = 0; i < maxIterations; i++) {
        const { format: iterFormat, options: iterOptions } = getSharpOutputOptions(
          mimetype,
          targetFormat,
          currentQuality
        );

        let tempBuffer;
        // Apply the correct sharp method based on iterFormat
        if (iterFormat === 'jpeg') {
          tempBuffer = await sharpInstance.jpeg(iterOptions).toBuffer();
        } else if (iterFormat === 'png') {
          tempBuffer = await sharpInstance.png(iterOptions).toBuffer();
        } else if (iterFormat === 'webp') {
          tempBuffer = await sharpInstance.webp(iterOptions).toBuffer();
        } else {
          // Fallback for unrecognized format in the loop, default to JPEG
          const fallbackIterOptions = getSharpOutputOptions(mimetype, 'jpeg', currentQuality);
          tempBuffer = await sharpInstance.jpeg(fallbackIterOptions.options).toBuffer();
        }

        if (tempBuffer.length < smallestSize) {
          smallestSize = tempBuffer.length;
          smallestBuffer = tempBuffer;
        }

        if (tempBuffer.length <= targetBytes || currentQuality <= minQuality) {
          compressedBuffer = smallestBuffer; // Use the smallest buffer found
          break;
        }

        currentQuality = Math.max(minQuality, currentQuality - 5); // Decrease quality by 5
        if (i === maxIterations - 1) {
          compressedBuffer = smallestBuffer; // If max iterations reached, use the smallest buffer found
        }
      }
    } else {
      // Quality-based compression or no target size specified
      // Ensure a specific output format is always applied
      if (outputFormat === 'jpeg') {
        compressedBuffer = await sharpInstance.jpeg(outputOptions).toBuffer();
      } else if (outputFormat === 'png') {
        compressedBuffer = await sharpInstance.png(outputOptions).toBuffer();
      } else if (outputFormat === 'webp') {
        compressedBuffer = await sharpInstance.webp(outputOptions).toBuffer();
      } else {
        // Robust fallback: if format is still 'original' or unrecognized, default to JPEG
        const fallbackOptions = getSharpOutputOptions(mimetype, 'jpeg', initialQuality);
        compressedBuffer = await sharpInstance.jpeg(fallbackOptions.options).toBuffer();
        outputFormat = 'jpeg'; // Update outputFormat to reflect the actual format used
        effectiveMimeType = 'image/jpeg'; // Update effective mimetype for response header
      }
    }

    res.set({
      'Content-Type': effectiveMimeType, // Use the determined effective mimetype
      'Content-Disposition': `attachment; filename="compressed_image.${outputFormat}"`
    });

    res.send(compressedBuffer);
  } catch (error) {
    console.error('Image compression error:', error);
    res.status(500).json({ error: 'Failed to compress image. Please try again.' });
  }
});

module.exports = router;
