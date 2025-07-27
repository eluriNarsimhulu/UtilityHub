// const express = require('express');
// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const router = express.Router();

// // Configure multer for document uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = path.join(__dirname, '../uploads');
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, `${Date.now()}-${file.originalname}`);
//   }
// });

// const upload = multer({ 
//   storage,
//   limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       'application/pdf',
//       'application/msword',
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
//     ];
    
//     if (allowedTypes.includes(file.mimetype)) {
//       cb(null, true);
//     } else {
//       cb(new Error('Only PDF and Word documents are allowed'));
//     }
//   }
// });

// // Document conversion endpoint
// router.post('/convert-document', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No document file provided' });
//     }

//     const { conversionType } = req.body;
//     const inputPath = req.file.path;
//     const outputPath = generateOutputPath(inputPath, conversionType);

//     // This is a simplified implementation
//     // In production, you'd use libraries like pdf2pic, docx-pdf, or external services
    
//     if (conversionType === 'to-pdf') {
//       await convertWordToPdf(inputPath, outputPath);
//     } else {
//       await convertPdfToWord(inputPath, outputPath);
//     }

//     // Send the converted file
//     res.download(outputPath, (err) => {
//       if (err) {
//         console.error('Download error:', err);
//       }
      
//       // Cleanup files
//       fs.unlink(inputPath, () => {});
//       fs.unlink(outputPath, () => {});
//     });

//   } catch (error) {
//     console.error('Document conversion error:', error);
//     res.status(500).json({ error: 'Failed to convert document' });
//   }
// });

// async function convertWordToPdf(inputPath, outputPath) {
//   // Placeholder: replace with actual conversion logic
//   fs.copyFileSync(inputPath, outputPath);
// }

// async function convertPdfToWord(inputPath, outputPath) {
//   // Placeholder: replace with actual conversion logic
//   fs.copyFileSync(inputPath, outputPath);
// }

// function generateOutputPath(inputPath, conversionType) {
//   const dir = path.dirname(inputPath);
//   const baseName = path.basename(inputPath, path.extname(inputPath));
//   const extension = conversionType === 'to-pdf' ? '.pdf' : '.docx';
  
//   return path.join(dir, `converted-${baseName}${extension}`);
// }

// module.exports = router;



const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const fse = require('fs-extra'); // For convenient file operations like ensuring directory and removing files
const libre = require('libreoffice-convert'); // The core conversion library
libre.convert.office = libre.convert.office || undefined; // Essential for some LibreOffice setups

const router = express.Router();

// Define the directory where uploaded files will be temporarily stored
// It's recommended to place this outside your public web server root if possible,
// to prevent direct access to uploaded files.
const uploadDir = path.join(__dirname, '../uploads');

// Ensure the upload directory exists. If it doesn't, fs-extra's ensureDirSync will create it.
try {
  fse.ensureDirSync(uploadDir);
  console.log(`Uploads directory ensured at: ${uploadDir}`);
} catch (err) {
  console.error(`Failed to ensure uploads directory: ${uploadDir}`, err);
  process.exit(1); // Exit if we can't create the upload directory, as conversions will fail
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // This is called by multer to determine where to save the file
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate a unique filename to prevent conflicts and ensure security
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_'); // Basic sanitization
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${sanitizedFilename}`);
  }
});

// Configure multer to handle single file uploads with limits and file type filtering
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB file size limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword', // .doc MIME type
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // .docx MIME type
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true); // Accept the file
    } else {
      // Reject the file with an error message
      cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
    }
  }
});

/**
 * POST /api/convert-document
 * Handles file uploads and conversion requests.
 */
router.post('/convert-document', upload.single('file'), async (req, res) => {
  // Check if a file was actually uploaded by multer
  if (!req.file) {
    return res.status(400).json({ error: 'No document file provided for conversion.' });
  }

  const { conversionType, enableOCR, outputWordFormat } = req.body;
  const inputPath = req.file.path; // Full path to the uploaded file
  const originalFilename = req.file.originalname; // Original filename for response

  let outputPath = ''; // Will store the path to the converted file
  let targetFormatExtension = ''; // E.g., '.pdf', '.docx', '.doc'

  try {
    // Validate conversion type and determine target format
    if (conversionType === 'to-pdf') {
      targetFormatExtension = '.pdf';
      const inputExtension = path.extname(originalFilename).toLowerCase();
      if (!['.doc', '.docx'].includes(inputExtension)) {
        throw new Error(`Input file must be a Word document (.doc or .docx) for PDF conversion. Received: ${inputExtension}`);
      }
    } else if (conversionType === 'to-word') {
      // Use the outputWordFormat selected by the user, default to .docx
      targetFormatExtension = outputWordFormat || '.docx';
      const inputExtension = path.extname(originalFilename).toLowerCase();
      if (inputExtension !== '.pdf') {
        throw new Error(`Input file must be a PDF document (.pdf) for Word conversion. Received: ${inputExtension}`);
      }
      if (enableOCR === 'true') {
        console.warn('OCR is enabled. Note: libreoffice-convert has limited native OCR capabilities for scanned PDFs. For robust OCR, consider integrating a dedicated OCR engine or service.');
        // If you were integrating a dedicated OCR library (e.g., Tesseract.js indirectly)
        // or an external OCR API, this is where you'd typically pre-process
        // scanned PDFs before passing them to LibreOffice for format conversion.
      }
    } else {
      throw new Error('Invalid conversion type specified in the request.');
    }

    // Generate the full path for the output (converted) file
    outputPath = generateOutputPath(inputPath, targetFormatExtension);

    // Read the input file into a buffer. libreoffice-convert works with buffers.
    const documentBuffer = fs.readFileSync(inputPath);

    // Perform the actual document conversion using libreoffice-convert
    // This is an asynchronous operation, so we wrap it in a Promise.
    const convertedBuffer = await new Promise((resolve, reject) => {
      libre.convert(documentBuffer, targetFormatExtension, undefined, (err, convertedBuf) => {
        if (err) {
          console.error('LibreOffice conversion failed:', err);
          // Provide a more specific error message if LibreOffice fails
          return reject(new Error(`Conversion process failed. Please ensure LibreOffice is correctly installed on the server.`));
        }
        if (!convertedBuf || convertedBuf.length === 0) {
            return reject(new Error('Conversion resulted in an empty file. This might indicate an unsupported document feature or a corrupted file.'));
        }
        resolve(convertedBuf);
      });
    });

    // Write the converted buffer to the specified output path
    fs.writeFileSync(outputPath, convertedBuffer);

    // Send the converted file back to the client for download
    // The second argument `originalFilename` (or a derived name) will be the default filename
    // presented to the user for download. We append the new extension.
    const downloadFileName = `${path.basename(originalFilename, path.extname(originalFilename))}${targetFormatExtension}`;
    res.download(outputPath, downloadFileName, (err) => {
      if (err) {
        console.error('File download failed after successful conversion:', err);
        // If download stream fails, attempt cleanup anyway
        if (fse.existsSync(inputPath)) fse.remove(inputPath, (removeErr) => removeErr && console.error("Error removing input file after download failure:", removeErr));
        if (fse.existsSync(outputPath)) fse.remove(outputPath, (removeErr) => removeErr && console.error("Error removing output file after download failure:", removeErr));
        return res.status(500).json({ error: 'Failed to send converted file for download.' });
      }

      // **CRITICAL: Clean up both the uploaded and converted files after successful download.**
      // This ensures user data privacy and prevents disk space accumulation.
      if (fse.existsSync(inputPath)) fse.remove(inputPath, (removeErr) => removeErr && console.error("Error removing input file:", removeErr));
      if (fse.existsSync(outputPath)) fse.remove(outputPath, (removeErr) => removeErr && console.error("Error removing output file:", removeErr));
    });

  } catch (error) {
    // Catch any errors that occur during the process (file upload, conversion, path generation)
    console.error('Document conversion process error:', error);

    // **CRITICAL: Ensure temporary files are removed even if an error occurs.**
    if (fse.existsSync(inputPath)) fse.remove(inputPath, (removeErr) => removeErr && console.error("Error removing input file on error:", removeErr));
    // Only attempt to remove outputPath if it was actually created and is different from inputPath
    if (outputPath && fse.existsSync(outputPath) && outputPath !== inputPath) {
      fse.remove(outputPath, (removeErr) => removeErr && console.error("Error removing output file on error:", removeErr));
    }

    // Send a 500 status code with the error message to the client
    res.status(500).json({ error: error.message || 'An unexpected error occurred during document conversion.' });
  }
});

/**
 * Helper function to generate a unique output file path based on the input path
 * and the desired target extension.
 * @param {string} inputPath - The full path of the input file.
 * @param {string} targetExtension - The desired extension for the output file (e.g., '.pdf', '.docx').
 * @returns {string} The full path for the output file.
 */
function generateOutputPath(inputPath, targetExtension) {
  const dir = path.dirname(inputPath); // Directory of the input file
  const baseName = path.basename(inputPath, path.extname(inputPath)); // Filename without extension
  // Append a unique suffix to the base name to avoid clashes, then the new extension
  return path.join(dir, `${baseName}-converted${targetExtension}`);
}

module.exports = router;