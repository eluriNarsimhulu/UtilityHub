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
const ytdl = require('@distube/ytdl-core');
const fs = require('fs');
const path = require('path');
const HttpsProxyAgent = require('https-proxy-agent'); // ADDED: Import HttpsProxyAgent

const router = express.Router();

// ADDED: Define proxy server URL from environment variable
// IMPORTANT: You MUST set PROXY_URL in your Render backend service's environment variables.
// Example: PROXY_URL = http://username:password@proxy.example.com:port
const PROXY_SERVER = process.env.PROXY_URL;
const agent = PROXY_SERVER ? new HttpsProxyAgent.HttpsProxyAgent(PROXY_SERVER) : null;

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

    // Validate URL using ytdl-core's built-in validator
    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log('Fetching info for URL:', url);

    // MODIFIED: Pass the agent to ytdl.getInfo
    const info = await ytdl.getInfo(url, { agent: agent });
    const videoDetails = info.videoDetails;

    // Prepare response object with relevant video details
    const response = {
      title: videoDetails.title,
      thumbnail: videoDetails.thumbnails && videoDetails.thumbnails.length > 0
        ? videoDetails.thumbnails[0].url
        : 'https://images.pexels.com/photos/1181316/pexels-photo-1181316.jpeg', // Fallback thumbnail
      duration: formatDuration(parseInt(videoDetails.lengthSeconds) || 0),
      author: videoDetails.author ? videoDetails.author.name : 'Unknown'
    };

    console.log('Video info fetched successfully:', response.title);
    res.json(response);
  } catch (error) {
    console.error('YouTube info error:', error.message);

    // Provide more specific error messages based on ytdl-core errors
    if (error.message.includes('Video unavailable')) {
      return res.status(404).json({ error: 'Video is unavailable or private' });
    } else if (error.message.includes('Sign in to confirm')) {
      return res.status(403).json({ error: 'Video requires age verification' });
    } else if (error.message.includes('This video is not available')) {
      return res.status(404).json({ error: 'Video not found or region blocked' });
    }

    // Generic error for other issues
    res.status(500).json({
      error: 'Failed to fetch video information. Please check the URL and try again.'
    });
  }
});

// Route to download YouTube video/audio
router.post('/youtube-download', async (req, res) => {
  try {
    const { url, format, quality } = req.body;

    // Validate URL
    if (!ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    console.log(`Starting download: format=${format}, quality=${quality}`);

    // MODIFIED: Get video info again, passing the agent
    const info = await ytdl.getInfo(url, { agent: agent });
    const videoDetails = info.videoDetails;

    // MODIFIED: Initialize options with the agent
    let options = { agent: agent };
    let contentType = '';
    let fileExtension = '';

    // Set download options based on format (MP3 or MP4)
    if (format === 'mp3') {
      options = {
        ...options, // Keep the agent
        filter: 'audioonly', // Only audio stream
        quality: 'highestaudio' // Highest available audio quality
      };
      contentType = 'audio/mpeg';
      fileExtension = 'mp3';
    } else {
      // For video (MP4), filter for formats with both video and audio
      options = {
        ...options, // Keep the agent
        filter: format => format.hasVideo && format.hasAudio,
        quality: 'highest' // Highest available combined video/audio quality
      };
      contentType = 'video/mp4';
      fileExtension = 'mp4';
    }

    // Sanitize filename to remove invalid characters
    const filename = `${videoDetails.title.replace(/[^\w\s.-]/gi, '')}.${fileExtension}`;
    
    // Set response headers for file download
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${filename}"`
    });

    console.log('Starting stream...');
    // MODIFIED: Pass options (which now include the agent) to ytdl
    const stream = ytdl(url, options);

    // Handle stream errors
    stream.on('error', (error) => {
      console.error('Download stream error:', error.message);
      // Only send error response if headers haven't been sent yet
      if (!res.headersSent) {
        res.status(500).json({ error: 'Download failed: ' + error.message });
      }
    });

    // Log when stream info is received
    stream.on('info', (info, format) => {
      console.log('Stream info received, starting download...');
    });

    // Pipe the video stream directly to the response
    stream.pipe(res);

  } catch (error) {
    console.error('YouTube download error:', error.message);
    // Only send error response if headers haven't been sent yet
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Download failed. Please try again or check if the video is available.'
      });
    }
  }
});

module.exports = router;
