import multer from 'multer';
import { Request } from 'express';

/**
 * ============================================================================
 * MULTER MIDDLEWARE FOR FILE UPLOADS
 * ============================================================================
 *
 * Handles image file uploads from admin panel:
 * - Course images
 * - Webinar images
 *
 * VALIDATION:
 * - Only accepts: jpg, jpeg, png
 * - Max file size: 2MB
 * - Files stored in memory temporarily before Cloudinary upload
 */

// Configure multer storage (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter - only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file mimetype
  if (file.mimetype === 'image/jpeg' ||
      file.mimetype === 'image/jpg' ||
      file.mimetype === 'image/png') {
    // Accept file
    cb(null, true);
  } else {
    // Reject file
    cb(new Error('Invalid file type. Only JPG, JPEG, and PNG files are allowed.'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit
  },
});

/**
 * Middleware for single image upload
 * Usage: upload.single('image')
 */
export const uploadSingle = upload.single('image');

/**
 * Middleware for multiple images upload (if needed in future)
 * Usage: upload.array('images', 5)
 */
export const uploadMultiple = upload.array('images', 5);

// Video upload configuration (500MB limit)
const videoFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only video files are allowed.'));
  }
};

const videoUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: videoFileFilter,
  limits: { fileSize: 500 * 1024 * 1024 },
});

export const uploadVideo = videoUpload.single('video');

// Document upload configuration for certification submissions
const documentFileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
  }
};

const documentUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: documentFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadDocument = documentUpload.single('file');

export default upload;
