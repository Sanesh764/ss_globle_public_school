import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifySuperAdmin } from '../middleware/admin.middleware.js';
import { upload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getSettings)
  .put(
    verifyJWT,
    verifySuperAdmin,
    upload.fields([
      { name: 'logo', maxCount: 1 },
      { name: 'aboutImage', maxCount: 1 },
      { name: 'aboutHeroBgImage', maxCount: 1 },
      { name: 'principalPhoto', maxCount: 1 },
      { name: 'directorPhoto', maxCount: 1 },
    ]),
    updateSettings
  );

export default router;
