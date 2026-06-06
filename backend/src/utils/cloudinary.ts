import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env';
import { logger } from './logger';

// Configure Cloudinary lazily — only if all three env vars are present
const isConfigured =
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
}

/**
 * Uploads a Buffer to Cloudinary and returns the secure HTTPS URL.
 * Returns null if Cloudinary is not configured (dev mode without credentials).
 *
 * @param buffer - File buffer to upload (e.g. Puppeteer PDF output)
 * @param folder - Cloudinary folder path (e.g. 'vendorbridge/invoices')
 * @param filename - Public ID / filename for the asset
 * @returns Secure HTTPS URL string, or null if unconfigured
 */
export const uploadBuffer = async (
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<string | null> => {
  if (!isConfigured) {
    logger.warn('Cloudinary not configured — skipping upload', { folder, filename });
    return null;
  }

  return new Promise<string | null>((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: 'raw', // PDFs are raw resources
        format: 'pdf',
        overwrite: true,
      },
      (error, result) => {
        if (error) {
          logger.error('Cloudinary upload failed', { error, folder, filename });
          reject(new Error(`Cloudinary upload failed: ${error.message}`));
          return;
        }
        resolve(result?.secure_url ?? null);
      }
    );
    uploadStream.end(buffer);
  });
};
