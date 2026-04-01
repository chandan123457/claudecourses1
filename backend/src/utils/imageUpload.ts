import cloudinary from '../config/cloudinary';
import { UploadApiResponse } from 'cloudinary';
import streamifier from 'streamifier';

/**
 * ============================================================================
 * IMAGE UPLOAD UTILITIES
 * ============================================================================
 *
 * Helper functions for uploading images to Cloudinary
 */

/**
 * Upload image buffer to Cloudinary
 * @param buffer - Image file buffer from multer
 * @param folder - Cloudinary folder name (courses/webinars)
 * @returns Cloudinary upload result with secure_url
 */
export const uploadToCloudinary = (
  buffer: Buffer,
  folder: string
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: `gradtopro/${folder}`, // Organize images by folder
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png'],
        transformation: [
          {
            width: 1200,
            height: 800,
            crop: 'fill',
            quality: 'auto',
            fetch_format: 'auto',
          },
        ],
      },
      (error, result) => {
        if (error) {
          console.error('❌ Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('✅ Image uploaded to Cloudinary:', result?.secure_url);
          resolve(result!);
        }
      }
    );

    // Convert buffer to stream and pipe to Cloudinary
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary by public_id
 * @param publicId - Cloudinary public_id of the image
 */
export const deleteFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    await cloudinary.uploader.destroy(publicId);
    console.log('✅ Image deleted from Cloudinary:', publicId);
  } catch (error) {
    console.error('❌ Error deleting image from Cloudinary:', error);
    throw error;
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param url - Full Cloudinary URL
 * @returns public_id
 */
export const getPublicIdFromUrl = (url: string): string | null => {
  try {
    // Example URL: https://res.cloudinary.com/cloud/image/upload/v123/gradtopro/courses/abc.jpg
    const parts = url.split('/');
    const uploadIndex = parts.indexOf('upload');

    if (uploadIndex === -1) return null;

    // Get everything after 'upload/v123/'
    const pathParts = parts.slice(uploadIndex + 2);
    const fullPath = pathParts.join('/');

    // Remove file extension
    const publicId = fullPath.replace(/\.[^/.]+$/, '');

    return publicId;
  } catch (error) {
    console.error('Error extracting public_id from URL:', error);
    return null;
  }
};