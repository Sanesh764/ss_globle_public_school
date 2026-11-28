import fs from 'node:fs';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { cleanupTempUploadedFile } from '../middleware/uploadMiddleware.js';
import { ApiError } from './ApiError.js';
import logger from './logger.js';

export const STUDENT_PHOTO_CLOUDINARY_FOLDER = 'ss_global_school/student_applications';

const isValidHttpsUrl = (value) =>
  typeof value === 'string' && value.trim().startsWith('https://');

/**
 * Uploads a validated temporary student photograph to Cloudinary.
 * Fails closed if Cloudinary is unconfigured or returns an invalid result,
 * and always removes the temporary local file.
 *
 * @param {object} file Multer file object
 * @returns {Promise<{ url: string, public_id: string }>}
 */
export const uploadStudentPhotoToCloudinary = async (file) => {
  try {
    if (!file || typeof file.path !== 'string' || !file.path.trim()) {
      throw new ApiError(400, 'Valid student photograph file is required.');
    }

    if (!fs.existsSync(file.path)) {
      throw new ApiError(400, 'Uploaded temporary photograph file could not be found.');
    }

    if (!isCloudinaryConfigured()) {
      throw new ApiError(
        503,
        'Photograph storage service is currently unavailable. Please try again later.'
      );
    }

    let uploadResult;
    try {
      uploadResult = await cloudinary.uploader.upload(file.path, {
        folder: STUDENT_PHOTO_CLOUDINARY_FOLDER,
        resource_type: 'image',
        use_filename: false,
        unique_filename: true,
        quality: 'auto',
        fetch_format: 'auto',
      });
    } catch (err) {
      logger.error('[StudentPhotoStorage] Cloudinary upload failed', err?.message || 'Upload error');
      throw new ApiError(502, 'Failed to store student photograph. Please try again.');
    }

    const secureUrl =
      typeof uploadResult?.secure_url === 'string' ? uploadResult.secure_url.trim() : '';
    const publicId =
      typeof uploadResult?.public_id === 'string' ? uploadResult.public_id.trim() : '';

    if (!isValidHttpsUrl(secureUrl) || !publicId) {
      if (publicId) {
        await cloudinary.uploader
          .destroy(publicId, { resource_type: 'image' })
          .catch((destroyErr) => {
            logger.warn(
              '[StudentPhotoStorage] Partial Cloudinary asset cleanup failed',
              destroyErr?.message || 'Destroy error'
            );
          });
      }
      throw new ApiError(502, 'Photograph storage returned an invalid response. Please try again.');
    }

    return {
      url: secureUrl,
      public_id: publicId,
    };
  } finally {
    if (file) {
      await cleanupTempUploadedFile(file).catch(() => {});
    }
  }
};

/**
 * Deletes a student photograph from Cloudinary using its public_id.
 * Rejects arbitrary URLs or empty identifiers.
 *
 * @param {string} publicId Cloudinary public_id
 * @returns {Promise<{ deleted: boolean, result: string, public_id: string }>}
 */
export const deleteStudentPhotoFromCloudinary = async (publicId) => {
  if (typeof publicId !== 'string') {
    throw new ApiError(400, 'A valid Cloudinary public_id is required.');
  }

  const cleanPublicId = publicId.trim();
  if (!cleanPublicId || /^https?:\/\//i.test(cleanPublicId)) {
    throw new ApiError(400, 'A valid Cloudinary public_id (not a URL) is required.');
  }

  if (!isCloudinaryConfigured()) {
    throw new ApiError(503, 'Photograph storage service is currently unavailable.');
  }

  try {
    const destroyResult = await cloudinary.uploader.destroy(cleanPublicId, {
      resource_type: 'image',
    });

    const status = destroyResult?.result || 'unknown';
    return {
      deleted: status === 'ok',
      result: status,
      public_id: cleanPublicId,
    };
  } catch (err) {
    logger.error('[StudentPhotoStorage] Cloudinary delete failed', err?.message || 'Delete error');
    throw new ApiError(502, 'Failed to remove student photograph from storage.');
  }
};
