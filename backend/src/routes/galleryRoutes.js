import express from 'express';
import {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
} from '../controllers/galleryController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getGalleryImages)
  .post(verifyJWT, verifyAdminRole, upload.single('image'), uploadGalleryImage);

router.route('/:id')
  .all(validateObjectId('id'))
  .delete(verifyJWT, verifyAdminRole, deleteGalleryImage);

export default router;
