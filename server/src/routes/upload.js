/**
 * Upload Routes
 * Handles file uploads for images
 */

const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const { upload, getFileUrl, deleteFile } = require('../services/upload');

const router = express.Router();

/**
 * POST /api/upload/image
 * Upload a single image
 */
router.post('/image', authenticate, requireRole(['tabsera_admin', 'center_admin']), (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
          success: false,
          message: 'File too large. Maximum size is 5MB.',
        });
      }
      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const folder = req.body.folder || 'general';
    const url = getFileUrl(folder, req.file.filename);

    res.json({
      success: true,
      url,
      filename: req.file.filename,
      originalName: req.file.originalname,
      size: req.file.size,
    });
  });
});

/**
 * DELETE /api/upload/image
 * Delete an uploaded image
 */
router.delete('/image', authenticate, requireRole(['tabsera_admin', 'center_admin']), (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({
      success: false,
      message: 'URL is required',
    });
  }

  // Only allow deleting files in uploads directory
  if (!url.startsWith('/uploads/')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file URL',
    });
  }

  const deleted = deleteFile(url);

  res.json({
    success: true,
    deleted,
  });
});

module.exports = router;
