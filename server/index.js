require('dotenv').config();
const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// Import route handlers
const imageRoutes = require('./routes/imageRoutes');
const youtubeRoutes = require('./routes/youtubeRoutes');
const instagramRoutes = require('./routes/instagramRoutes');
const documentRoutes = require('./routes/documentRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Routes
app.use('/api', imageRoutes);
app.use('/api', youtubeRoutes);
app.use('/api', instagramRoutes);
app.use('/api', documentRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'UtilityHub API is running' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: error.message 
  });
});

// Cleanup temp files periodically
const cleanupInterval = setInterval(() => {
  const files = fs.readdirSync(uploadsDir);
  const now = Date.now();
  const maxAge = 60 * 60 * 1000; // 1 hour

  files.forEach(file => {
    const filePath = path.join(uploadsDir, file);
    const stat = fs.statSync(filePath);
    if (now - stat.mtime.getTime() > maxAge) {
      fs.unlinkSync(filePath);
    }
  });
}, 30 * 60 * 1000); // Run every 30 minutes

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;