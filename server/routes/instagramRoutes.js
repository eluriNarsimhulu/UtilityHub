const express = require('express');
const { igdl } = require('insta-fetcher');
const router = express.Router();

// --- Rate Limiting ---
const rateLimitMap = new Map();
const RATE_LIMIT = 15;
const RATE_WINDOW = 60 * 1000; // ms

const rateLimit = (req, res, next) => {
  const clientIp = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();

  // Clean up old entries
  if (rateLimitMap.size > 1000) {
    for (let [ip, data] of rateLimitMap.entries()) {
      if (now > data.resetTime) rateLimitMap.delete(ip);
    }
  }

  if (!rateLimitMap.has(clientIp)) {
    rateLimitMap.set(clientIp, { count: 1, resetTime: now + RATE_WINDOW });
    return next();
  }
  const clientData = rateLimitMap.get(clientIp);
  if (now > clientData.resetTime) {
    clientData.count = 1;
    clientData.resetTime = now + RATE_WINDOW;
    return next();
  }
  if (clientData.count >= RATE_LIMIT) {
    const retryAfterSeconds = Math.ceil((clientData.resetTime - now) / 1000);
    return res.status(429).json({
      error: 'Too many requests. Please try again later.',
      retryAfter: retryAfterSeconds,
      success: false
    });
  }
  clientData.count++;
  next();
};

// --- URL Validation ---
const validateInstagramUrl = (url) => {
  const instagramRegex = /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/[A-Za-z0-9_-]+(?:[\/?].*)?$/;
  return instagramRegex.test(url);
};

// --- Download endpoint ---
router.post('/download', rateLimit, async (req, res) => {
  const { url } = req.body;
  if (!url) {
    return res.status(400).json({ error: 'URL is required', success: false });
  }
  if (!validateInstagramUrl(url)) {
    return res.status(400).json({
      error: 'Invalid Instagram URL format. Please provide a direct post, reel, or IGTV link.',
      success: false
    });
  }
  try {
    const result = await igdl(url);
    if (!result || !result.url_list || result.url_list.length === 0) {
      return res.status(404).json({
        error: 'No video found, content might be private, deleted, or unavailable.',
        success: false
      });
    }
    // Ensure all video URLs are valid http urls (string)
    const url_list = result.url_list
      .filter(videoUrl => typeof videoUrl === 'string' && videoUrl.startsWith('http'))
      .map((videoUrl, index) => ({
        quality: `Quality ${index + 1}`,
        url: videoUrl,
        type: 'video/mp4'
      }));

    return res.json({
      success: true,
      data: {
        title: result.title || 'Instagram Video',
        thumbnail: result.thumbnail || null,
        duration: result.duration || null,
        view_count: result.view_count || null,
        like_count: result.like_count || null,
        comment_count: result.comment_count || null,
        username: result.username || null,
        caption: result.caption || null,
        url_list,
        created_at: result.taken_at_timestamp
          ? new Date(result.taken_at_timestamp * 1000).toISOString()
          : null
      }
    });
  } catch (err) {
    // This guarantees a JSON response
    let statusCode = 500;
    let errorMessage = 'Failed to fetch Instagram content. An unexpected error occurred.';

    if (err.message && (
        err.message.includes('private') ||
        err.message.includes('login required') ||
        err.message.includes('restricted')
      )) {
      statusCode = 403;
      errorMessage = 'This content is private, restricted, or requires login/authentication.';
    } else if (err.message && (
        err.message.includes('not found') ||
        err.message.includes('invalid link') ||
        err.message.includes('No media found')
      )) {
      statusCode = 404;
      errorMessage = 'Content not found. Please check the URL or if the post still exists.';
    } else if (err.message && (
        err.message.includes('rate limit') ||
        err.message.includes('blocked') ||
        err.message.includes('Too Many Requests') ||
        err.message.includes('blocked by Instagram')
      )) {
      statusCode = 429;
      errorMessage = 'Instagram is currently rate limiting requests or has blocked this IP. Please try again later.';
    } else if (err.message && (
        err.message.includes('timeout') ||
        err.name === 'AbortError' ||
        err.code === 'ETIMEDOUT'
      )) {
      statusCode = 504;
      errorMessage = 'Request to Instagram timed out. The server might be busy or network issues occurred.';
    } else if (err.message && (
        err.message.includes('Captcha Required') || err.message.includes('Challenge Required')
      )) {
      statusCode = 400; // Bad Request
      errorMessage = 'Instagram is requiring a captcha or challenge. This tool cannot bypass it.';
    }

    return res.status(statusCode).json({
      error: errorMessage,
      success: false,
      details: process.env.NODE_ENV === "development" ? (err.message || err) : undefined
    });
  }
});

// --- Health Check endpoint ---
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Instagram Downloader API',
    timestamp: new Date().toISOString(),
    node_env: process.env.NODE_ENV || 'production'
  });
});

module.exports = router;
