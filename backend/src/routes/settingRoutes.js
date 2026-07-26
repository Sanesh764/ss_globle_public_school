import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(protectAdmin, upload.single('logo'), updateSettings);

export default router;
