import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * ============================================================================
 * CLOUDINARY CONFIGURATION
 * ============================================================================
 *
 * Configures Cloudinary for image upload and management
 * Used for storing course/webinar images uploaded by admin
 */

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Verify configuration
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Cloudinary configuration missing! Please check .env file');
  throw new Error('Cloudinary configuration incomplete');
}

console.log('✅ Cloudinary configured successfully');

export default cloudinary;