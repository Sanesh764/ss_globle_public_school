import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `img-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|svg/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype);

  if (extName && mimeType) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files (jpeg, jpg, png, webp, svg) are allowed!'));
  }
};

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter,
});

// Helper function to process uploaded image file and get public URL
export const processUploadedFile = async (file, folder = 'ss_global_school') => {
  if (!file) return { url: '', public_id: '' };

  if (isCloudinaryConfigured) {
    try {
      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'image',
      });
      // Optionally clean up local temp file after Cloudinary upload
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
      return {
        url: result.secure_url,
        public_id: result.public_id,
      };
    } catch (err) {
      console.error('[Cloudinary Upload Error, falling back to local]', err.message);
    }
  }

  // Local URL fallback
  const localUrl = `/uploads/${file.filename}`;
  return {
    url: localUrl,
    public_id: file.filename,
  };
};

// Helper function to delete image
export const deleteUploadedFile = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) return;

  if (isCloudinaryConfigured && !publicIdOrUrl.startsWith('/uploads/')) {
    try {
      await cloudinary.uploader.destroy(publicIdOrUrl);
    } catch (err) {
      console.error('[Cloudinary Delete Error]', err.message);
    }
  } else {
    // Delete local file if present
    const fileName = path.basename(publicIdOrUrl);
    const localFilePath = path.join(uploadsDir, fileName);
    if (fs.existsSync(localFilePath)) {
      try {
        fs.unlinkSync(localFilePath);
      } catch (err) {
        console.error('[Local Delete Error]', err.message);
      }
    }
  }
};
