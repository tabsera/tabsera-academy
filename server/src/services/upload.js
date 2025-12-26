/**
 * File Upload Service
 * Handles image uploads with multer
 */

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Base upload directory
const UPLOAD_DIR = path.join(__dirname, '../../uploads');

// Ensure upload directories exist
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Initialize directories
ensureDir(path.join(UPLOAD_DIR, 'tracks'));
ensureDir(path.join(UPLOAD_DIR, 'courses'));

// Allowed image types
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// File filter
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folder = req.body.folder || 'general';
    const uploadPath = path.join(UPLOAD_DIR, folder);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// Multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
  },
});

// Get relative URL for uploaded file
const getFileUrl = (folder, filename) => {
  return `/uploads/${folder}/${filename}`;
};

// Delete file
const deleteFile = (filePath) => {
  const fullPath = path.join(UPLOAD_DIR, filePath.replace('/uploads/', ''));
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    return true;
  }
  return false;
};

module.exports = {
  upload,
  getFileUrl,
  deleteFile,
  UPLOAD_DIR,
};
