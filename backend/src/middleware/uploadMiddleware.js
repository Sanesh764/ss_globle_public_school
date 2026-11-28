import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';
import { ApiError } from '../utils/ApiError.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure local uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage configuration for Images
const storage = multer.diskStorage({
  destination(req, file, cb) {//cb -> call back
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

// ====================================================
// DEDICATED STUDENT PHOTO UPLOAD MIDDLEWARE (PUBLIC)
// ====================================================

export const STUDENT_PHOTO_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

const EXT_TO_FORMAT = {
  '.jpg': 'jpeg',
  '.jpeg': 'jpeg',
  '.png': 'png',
  '.webp': 'webp',
};

const MIME_TO_FORMAT = {
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp',
};

export const cleanupTempUploadedFile = async (fileOrPath) => {
  const filePath = typeof fileOrPath === 'string' ? fileOrPath : fileOrPath?.path;
  if (!filePath) return false;

  const resolvedUploadsDir = path.resolve(uploadsDir);
  const resolvedTarget = path.resolve(filePath);
  if (!resolvedTarget.startsWith(resolvedUploadsDir + path.sep)) {
    return false;
  }

  try {
    await fs.promises.unlink(resolvedTarget);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') {
      return false;
    }
    throw err;
  }
};

const detectImageSignature = async (filePath) => {
  const handle = await fs.promises.open(filePath, 'r');
  try {
    const buffer = Buffer.alloc(12);
    const { bytesRead } = await handle.read(buffer, 0, 12, 0);

    if (bytesRead >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
      return 'jpeg';
    }
    if (
      bytesRead >= 4 &&
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47
    ) {
      return 'png';
    }
    if (
      bytesRead >= 12 &&
      buffer.toString('ascii', 0, 4) === 'RIFF' &&
      buffer.toString('ascii', 8, 12) === 'WEBP'
    ) {
      return 'webp';
    }
    return null;
  } finally {
    await handle.close();
  }
};

const studentPhotoStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadsDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `student-photo-${uniqueSuffix}${ext}`);
  },
});

const studentPhotoFileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  const mime = (file.mimetype || '').toLowerCase();

  const extFormat = EXT_TO_FORMAT[ext];
  const mimeFormat = MIME_TO_FORMAT[mime];

  if (!extFormat || !mimeFormat) {
    return cb(
      new ApiError(400, 'Only JPEG, JPG, PNG, and WebP image files are allowed for student photographs.')
    );
  }

  if (extFormat !== mimeFormat) {
    return cb(
      new ApiError(400, 'Image file extension does not match its declared MIME type.')
    );
  }

  return cb(null, true);
};

const studentPhotoMulter = multer({
  storage: studentPhotoStorage,
  limits: {
    fileSize: STUDENT_PHOTO_MAX_SIZE,
    files: 1,
  },
  fileFilter: studentPhotoFileFilter,
});

export const studentPhotoUpload = (req, res, next) => {
  if (!req.is('multipart/form-data')) {
    return next();
  }

  studentPhotoMulter.single('photo')(req, res, async (err) => {
    if (err) {
      if (req.file) {
        await cleanupTempUploadedFile(req.file).catch(() => {});
        req.file = undefined;
      }

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return next(new ApiError(400, 'Student photograph must not exceed 2 MB.'));
        }
        if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
          return next(
            new ApiError(400, 'Only one photograph may be uploaded using the "photo" field.')
          );
        }
        return next(new ApiError(400, err.message));
      }

      return next(err);
    }

    if (!req.file) {
      return next();
    }

    try {
      const ext = path.extname(req.file.originalname || '').toLowerCase();
      const expectedFormat = EXT_TO_FORMAT[ext];
      const detectedFormat = await detectImageSignature(req.file.path);

      if (!detectedFormat || detectedFormat !== expectedFormat) {
        await cleanupTempUploadedFile(req.file);
        req.file = undefined;
        return next(
          new ApiError(
            400,
            'Invalid image file signature. Only genuine JPEG, PNG, and WebP images are allowed.'
          )
        );
      }

      return next();
    } catch (fsErr) {
      await cleanupTempUploadedFile(req.file).catch(() => {});
      req.file = undefined;
      return next(new ApiError(500, 'Failed to verify uploaded photograph. Please try again.'));
    }
  });
};
