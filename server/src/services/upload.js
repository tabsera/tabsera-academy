/**
 * File Upload Service
 * Handles image and document uploads with multer
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
ensureDir(path.join(UPLOAD_DIR, 'certifications'));
ensureDir(path.join(UPLOAD_DIR, 'avatars'));

// Allowed file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_DOCUMENT_SIZE = 25 * 1024 * 1024; // 25MB

// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
  }
};

// File filter for documents (certifications)
const documentFileFilter = (req, file, cb) => {
  if (ALLOWED_DOCUMENT_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, JPG, and PNG are allowed.'), false);
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

// Multer upload instance for images
const upload = multer({
  storage,
  fileFilter: imageFileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
  },
});

// Multer upload instance for documents (certifications)
const uploadDocument = multer({
  storage,
  fileFilter: documentFileFilter,
  limits: {
    fileSize: MAX_DOCUMENT_SIZE,
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

// Get file info
const getFileInfo = (filePath) => {
  const fullPath = path.join(UPLOAD_DIR, filePath.replace('/uploads/', ''));
  if (fs.existsSync(fullPath)) {
    const stats = fs.statSync(fullPath);
    return {
      exists: true,
      size: stats.size,
      created: stats.birthtime,
    };
  }
  return { exists: false };
};

module.exports = {
  upload,
  uploadDocument,
  getFileUrl,
  deleteFile,
  getFileInfo,
  UPLOAD_DIR,
  ALLOWED_DOCUMENT_TYPES,
  MAX_DOCUMENT_SIZE,
};
