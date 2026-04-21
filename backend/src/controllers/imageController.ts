import { Request, Response, NextFunction } from 'express';
import { asyncHandler, AppError } from '../middlewares/errorHandler';
import { uploadToCloudinary, uploadVideoToCloudinary } from '../utils/imageUpload';
import { uploadVideo } from '../middlewares/upload';
import logger from '../utils/logger';

/**
 * ============================================================================
 * IMAGE UPLOAD CONTROLLER
 * ============================================================================
 *
 * Handles image upload requests from admin panel
 * Uploads images to Cloudinary and returns URLs
 */

export const imageController = {
  /**
   * Upload single image
   * POST /api/admin/upload/image
   */
  uploadImage: asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    // Check if file was uploaded
    if (!req.file) {
      throw new AppError('No image file provided', 400);
    }

    // Get folder from request (courses or webinars)
    const folder = req.body.folder || 'general';

    // Validate folder name
    if (!['courses', 'webinars', 'general'].includes(folder)) {
      throw new AppError('Invalid folder name', 400);
    }

    logger.info('Uploading image to Cloudinary', {
      filename: req.file.originalname,
      size: req.file.size,
      folder,
    });

    try {
      // Upload to Cloudinary
      const result = await uploadToCloudinary(req.file.buffer, folder);

      logger.info('Image uploaded successfully', {
        url: result.secure_url,
        publicId: result.public_id,
      });

      // Return the image URL
      res.status(200).json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          url: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          size: result.bytes,
        },
      });
    } catch (error: any) {
      logger.error('Image upload failed', { error: error.message });
      throw new AppError('Failed to upload image to cloud storage', 500);
    }
  }),
  uploadVideo: [
    uploadVideo,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
      if (!req.file) throw new AppError('No video file provided', 400);
      const folder = req.body.folder || 'videos';
      try {
        const result = await uploadVideoToCloudinary(req.file.buffer, folder);
        logger.info('Video uploaded successfully', { url: result.secure_url });
        res.status(200).json({
          success: true,
          message: 'Video uploaded successfully',
          data: { url: result.secure_url, publicId: result.public_id },
        });
      } catch (error: any) {
        logger.error('Video upload failed', { error: error.message });
        throw new AppError('Failed to upload video to cloud storage', 500);
      }
    }),
  ],
};

export default imageController;