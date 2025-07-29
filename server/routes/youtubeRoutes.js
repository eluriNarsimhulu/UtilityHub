// // const express = require('express');
// // const ytdl = require('@distube/ytdl-core');
// // const fs = require('fs');
// // const path = require('path');

// // const router = express.Router();

// // // Get YouTube video info
// // router.post('/youtube-info', async (req, res) => {
// //   try {
// //     const { url } = req.body;

// //     if (!url || !ytdl.validateURL(url)) {
// //       return res.status(400).json({ error: 'Invalid YouTube URL' });
// //     }

// //     console.log('Fetching info for URL:', url);

// //     const info = await ytdl.getInfo(url);
// //     const videoDetails = info.videoDetails;

// //     const response = {
// //       title: videoDetails.title,
// //       thumbnail: videoDetails.thumbnails && videoDetails.thumbnails.length > 0 
// //         ? videoDetails.thumbnails[0].url 
// //         : 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg',
// //       duration: formatDuration(parseInt(videoDetails.lengthSeconds) || 0),
// //       author: videoDetails.author ? videoDetails.author.name : 'Unknown'
// //     };

// //     console.log('Video info fetched successfully:', response.title);
// //     res.json(response);
// //   } catch (error) {
// //     console.error('YouTube info error:', error.message);
    
// //     // Provide more specific error messages
// //     if (error.message.includes('Video unavailable')) {
// //       return res.status(404).json({ error: 'Video is unavailable or private' });
// //     } else if (error.message.includes('Sign in to confirm')) {
// //       return res.status(403).json({ error: 'Video requires age verification' });
// //     } else if (error.message.includes('This video is not available')) {
// //       return res.status(404).json({ error: 'Video not found or region blocked' });
// //     }
    
// //     res.status(500).json({ 
// //       error: 'Failed to fetch video information. Please check the URL and try again.' 
// //     });
// //   }
// // });

// // // Download YouTube video/audio
// // router.post('/youtube-download', async (req, res) => {
// //   try {
// //     const { url, format, quality } = req.body;

// //     if (!ytdl.validateURL(url)) {
// //       return res.status(400).json({ error: 'Invalid YouTube URL' });
// //     }

// //     console.log(`Starting download: ${format} - ${quality}`);

// //     const info = await ytdl.getInfo(url);
// //     const videoDetails = info.videoDetails;

// //     let options = {};
// //     let contentType = '';
// //     let fileExtension = '';

// //     if (format === 'mp3') {
// //       options = { 
// //         filter: 'audioonly',
// //         quality: 'highestaudio'
// //       };
// //       contentType = 'audio/mpeg';
// //       fileExtension = 'mp3';
// //     } else {
// //       // For video, try to get the best available quality
// //       options = { 
// //         filter: format => format.hasVideo && format.hasAudio,
// //         quality: 'highest'
// //       };
// //       contentType = 'video/mp4';
// //       fileExtension = 'mp4';
// //     }

// //     // Set response headers
// //     const filename = `${videoDetails.title.replace(/[^\w\s]/gi, '')}.${fileExtension}`;
// //     res.set({
// //       'Content-Type': contentType,
// //       'Content-Disposition': `attachment; filename="${filename}"`
// //     });

// //     console.log('Starting stream...');
// //     const stream = ytdl(url, options);
    
// //     stream.on('error', (error) => {
// //       console.error('Download stream error:', error.message);
// //       if (!res.headersSent) {
// //         res.status(500).json({ error: 'Download failed: ' + error.message });
// //       }
// //     });

// //     stream.on('info', (info, format) => {
// //       console.log('Stream info received, starting download...');
// //     });

// //     stream.pipe(res);

// //   } catch (error) {
// //     console.error('YouTube download error:', error.message);
// //     if (!res.headersSent) {
// //       res.status(500).json({ 
// //         error: 'Download failed. Please try again or check if the video is available.' 
// //       });
// //     }
// //   }
// // });

// // function formatDuration(seconds) {
// //   if (!seconds || seconds === 0) return '0:00';
  
// //   const hrs = Math.floor(seconds / 3600);
// //   const mins = Math.floor((seconds % 3600) / 60);
// //   const secs = seconds % 60;

// //   if (hrs > 0) {
// //     return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
// //   }
// //   return `${mins}:${secs.toString().padStart(2, '0')}`;
// // }

// // module.exports = router;



// const express = require('express');
// const ytdl = require('@distube/ytdl-core');
// const fs = require('fs');
// const path = require('path');

// const router = express.Router();

// /**
//  * Formats duration from seconds into HH:MM:SS or MM:SS format.
//  * @param {number} seconds The total duration in seconds.
//  * @returns {string} Formatted duration string.
//  */
// function formatDuration(seconds) {
//   if (!seconds || seconds === 0) return '0:00';

//   const hrs = Math.floor(seconds / 3600);
//   const mins = Math.floor((seconds % 3600) / 60);
//   const secs = seconds % 60;

//   if (hrs > 0) {
//     return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   }
//   return `${mins}:${secs.toString().padStart(2, '0')}`;
// }

// // Route to get YouTube video information
// router.post('/youtube-info', async (req, res) => {
//   try {
//     const { url } = req.body;

//     // Validate URL using ytdl-core's built-in validator
//     if (!url || !ytdl.validateURL(url)) {
//       return res.status(400).json({ error: 'Invalid YouTube URL' });
//     }

//     console.log('Fetching info for URL:', url);

//     // Get video information using ytdl-core
//     const info = await ytdl.getInfo(url);
//     const videoDetails = info.videoDetails;

//     // Prepare response object with relevant video details
//     const response = {
//       title: videoDetails.title,
//       thumbnail: videoDetails.thumbnails && videoDetails.thumbnails.length > 0
//         ? videoDetails.thumbnails[0].url
//         : 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg', // Fallback thumbnail
//       duration: formatDuration(parseInt(videoDetails.lengthSeconds) || 0),
//       author: videoDetails.author ? videoDetails.author.name : 'Unknown'
//     };

//     console.log('Video info fetched successfully:', response.title);
//     res.json(response);
//   } catch (error) {
//     console.error('YouTube info error:', error.message);

//     // Provide more specific error messages based on ytdl-core errors
//     if (error.message.includes('Video unavailable')) {
//       return res.status(404).json({ error: 'Video is unavailable or private' });
//     } else if (error.message.includes('Sign in to confirm')) {
//       return res.status(403).json({ error: 'Video requires age verification' });
//     } else if (error.message.includes('This video is not available')) {
//       return res.status(404).json({ error: 'Video not found or region blocked' });
//     }

//     // Generic error for other issues
//     res.status(500).json({
//       error: 'Failed to fetch video information. Please check the URL and try again.'
//     });
//   }
// });

// // Route to download YouTube video/audio
// router.post('/youtube-download', async (req, res) => {
//   try {
//     const { url, format, quality } = req.body;

//     // Validate URL
//     if (!ytdl.validateURL(url)) {
//       return res.status(400).json({ error: 'Invalid YouTube URL' });
//     }

//     console.log(`Starting download: format=${format}, quality=${quality}`);

//     const info = await ytdl.getInfo(url); // Get video info again for fresh data
//     const videoDetails = info.videoDetails;

//     let options = {};
//     let contentType = '';
//     let fileExtension = '';

//     // Set download options based on format (MP3 or MP4)
//     if (format === 'mp3') {
//       options = {
//         filter: 'audioonly', // Only audio stream
//         quality: 'highestaudio' // Highest available audio quality
//       };
//       contentType = 'audio/mpeg';
//       fileExtension = 'mp3';
//     } else {
//       // For video (MP4), filter for formats with both video and audio
//       options = {
//         filter: format => format.hasVideo && format.hasAudio,
//         quality: 'highest' // Highest available combined video/audio quality
//       };
//       contentType = 'video/mp4';
//       fileExtension = 'mp4';
//     }

//     // Sanitize filename to remove invalid characters
//     const filename = `${videoDetails.title.replace(/[^\w\s.-]/gi, '')}.${fileExtension}`;
    
//     // Set response headers for file download
//     res.set({
//       'Content-Type': contentType,
//       'Content-Disposition': `attachment; filename="${filename}"`
//     });

//     console.log('Starting stream...');
//     const stream = ytdl(url, options);

//     // Handle stream errors
//     stream.on('error', (error) => {
//       console.error('Download stream error:', error.message);
//       // Only send error response if headers haven't been sent yet
//       if (!res.headersSent) {
//         res.status(500).json({ error: 'Download failed: ' + error.message });
//       }
//     });

//     // Log when stream info is received
//     stream.on('info', (info, format) => {
//       console.log('Stream info received, starting download...');
//     });

//     // Pipe the video stream directly to the response
//     stream.pipe(res);

//   } catch (error) {
//     console.error('YouTube download error:', error.message);
//     // Only send error response if headers haven't been sent yet
//     if (!res.headersSent) {
//       res.status(500).json({
//         error: 'Download failed. Please try again or check if the video is available.'
//       });
//     }
//   }
// });

// module.exports = router;


const express = require('express');
// MODIFIED: Import yt-dlp-exec directly as a function/object, not a named constructor
const ytdlp = require('yt-dlp-exec');
const fs = require('fs');
const path = require('path');

// ADDED: Initialize the Express router
const router = express.Router();

// Initialize yt-dlp-exec. It will automatically find the yt-dlp executable if installed in /usr/local/bin
// REMOVED: `new YtDlpExec()` is no longer needed as `require('yt-dlp-exec')` directly gives the executable function.

// Define proxy server URL from environment variable
// yt-dlp has its own proxy handling, which is more robust.
const PROXY_SERVER = process.env.PROXY_URL;

/**
 * Formats duration from seconds into HH:MM:SS or MM:SS format.
 * @param {number} seconds The total duration in seconds.
 * @returns {string} Formatted duration string.
 */
function formatDuration(seconds) {
  if (!seconds || seconds === 0) return '0:00';

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// Route to get YouTube video information
router.post('/youtube-info', async (req, res) => {
  try {
    const { url } = req.body;

    // Basic URL validation (yt-dlp is very robust, but good to have a quick check)
    if (!url || !(url.includes('youtube.com/watch') || url.includes('youtu.be/'))) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log('Fetching info for URL:', url);

    // MODIFIED: Use yt-dlp to get video information
    // --dump-json: dumps video information as JSON
    // --no-warnings: suppresses warnings
    // --proxy: specifies the proxy to use
    const args = ['--dump-json', '--no-warnings', url];
    if (PROXY_SERVER) {
      args.push('--proxy', PROXY_SERVER);
    }

    // MODIFIED: Directly call ytdlp.exec() as ytdlp is now the function itself
    const { stdout } = await ytdlp.exec(args);
    const info = JSON.parse(stdout);

    // Prepare response object with relevant video details
    const response = {
      title: info.title,
      thumbnail: info.thumbnail || 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg', // Fallback thumbnail
      duration: formatDuration(parseInt(info.duration) || 0), // yt-dlp provides duration in seconds
      author: info.uploader || 'Unknown', // uploader is the author in yt-dlp
      videoId: info.id // yt-dlp provides video ID directly
    };

    console.log('Video info fetched successfully:', response.title);
    res.json(response);
  } catch (error) {
    console.error('YouTube info error:', error.message);
    // yt-dlp errors are often more descriptive
    res.status(500).json({
      error: `Failed to fetch video information: ${error.message}. This might be due to an invalid URL, region restrictions, or proxy issues.`,
      details: error.message // Provide more details for debugging
    });
  }
});

// Route to download YouTube video/audio
router.post('/youtube-download', async (req, res) => {
  try {
    const { url, format, quality } = req.body;

    // Basic URL validation
    if (!url || !(url.includes('youtube.com/watch') || url.includes('youtu.be/'))) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log(`Starting download: format=${format}, quality=${quality}`);

    const args = [url, '-o', '-']; // -o - means output to stdout (pipe)
    if (PROXY_SERVER) {
      args.push('--proxy', PROXY_SERVER);
    }

    let contentType = '';
    let fileExtension = '';

    if (format === 'mp3') {
      // For MP3, extract audio and convert to MP3
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '128K'); // -x for extract audio, --audio-format for format
      contentType = 'audio/mpeg';
      fileExtension = 'mp3';
    } else {
      // For MP4, select best video+audio format
      args.push('-f', 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]'); // Select best mp4 with video and audio
      // You can refine quality selection here if needed, e.g., `-f 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[ext=mp4]'`
      contentType = 'video/mp4';
      fileExtension = 'mp4';
    }

    // Get video title for filename
    const infoArgs = ['--get-title', '--no-warnings', url];
    if (PROXY_SERVER) {
      infoArgs.push('--proxy', PROXY_SERVER);
    }
    // MODIFIED: Directly call ytdlp.exec()
    const { stdout: titleStdout } = await ytdlp.exec(infoArgs);
    const videoTitle = titleStdout.trim().replace(/[^\w\s.-]/gi, ''); // Sanitize title

    const filename = `${videoTitle}.${fileExtension}`;
    
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    });

    console.log('Starting stream...');

    // MODIFIED: Directly call ytdlp.exec()
    const downloadProcess = ytdlp.exec(args, { stdio: ['ignore', 'pipe', 'pipe'] });

    // Pipe stdout to response
    downloadProcess.stdout.pipe(res);

    // Handle errors from yt-dlp process
    downloadProcess.stderr.on('data', (data) => {
      console.error(`yt-dlp stderr: ${data.toString()}`);
    });

    downloadProcess.on('close', (code) => {
      if (code !== 0) {
        console.error(`yt-dlp process exited with code ${code}`);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Download failed during processing.' });
        }
      } else {
        console.log('Download stream finished successfully.');
      }
    });

    downloadProcess.on('error', (err) => {
      console.error('yt-dlp process error:', err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed due to process error.' });
      }
    });

  } catch (error) {
    console.error('YouTube download error:', error.message);
    if (!res.headersSent) {
      res.status(500).json({
        error: `Download failed: ${error.message}. Please try again or check if the video is available.`,
        details: error.message
      });
    }
  }
});

module.exports = router;
