import express from 'express';
import {
  getGalleryImages,
  uploadGalleryImage,
  deleteGalleryImage,
} from '../controllers/galleryController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getGalleryImages)
  .post(protectAdmin, upload.single('image'), uploadGalleryImage);

router.route('/:id')
  .delete(protectAdmin, deleteGalleryImage);

export default router;
