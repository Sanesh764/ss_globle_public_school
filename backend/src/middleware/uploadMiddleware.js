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

// Storage configuration for Images
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

// Helper function to process uploaded image file
export const processUploadedFile = async (file, folder = 'ss_global_school') => {
  if (!file) return { url: '', public_id: '' };

  if (isCloudinaryConfigured()) {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      const result = await cloudinary.uploader.upload(file.path, {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      });

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

  const localUrl = `/uploads/${file.filename}`;
  return {
    url: localUrl,
    public_id: file.filename,
  };
};

// Helper function to delete image file
export const deleteUploadedFile = async (publicIdOrUrl) => {
  if (!publicIdOrUrl) return;

  if (isCloudinaryConfigured() && (publicIdOrUrl.startsWith('http') || publicIdOrUrl.includes('/'))) {
    try {
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
      });

      let publicId = publicIdOrUrl;
      if (publicIdOrUrl.includes('/image/upload/')) {
        const parts = publicIdOrUrl.split('/image/upload/');
        if (parts[1]) {
          publicId = parts[1].replace(/^v\d+\//, '');
        }
      }

      // Strip file extension (.jpg, .jpeg, .png, .webp) for Cloudinary public_id destroy API
      publicId = publicId.replace(/\.[^/.]+$/, '');

      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch (err) {
      console.error('[Cloudinary Delete Error]', err.message);
    }
  } else {
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
