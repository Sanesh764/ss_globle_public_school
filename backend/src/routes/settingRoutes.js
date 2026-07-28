import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(verifyJWT, verifyAdminRole, upload.single('logo'), updateSettings);

export default router;
