import express from 'express';
import {
  getPublicHeroSlides,
  getAdminHeroSlides,
  createHeroSlide,
  updateHeroSlide,
  deleteHeroSlide,
  reorderHeroSlides,
} from '../controllers/heroSliderController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifySuperAdmin } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { upload } from '../middleware/uploadMiddleware.js';

export const publicHeroSliderRouter = express.Router();
publicHeroSliderRouter.get('/', getPublicHeroSlides);

export const adminHeroSliderRouter = express.Router();
adminHeroSliderRouter.use(verifyJWT, verifySuperAdmin);

adminHeroSliderRouter.route('/')
  .get(getAdminHeroSlides)
  .post(upload.single('backgroundImage'), createHeroSlide);

adminHeroSliderRouter.patch('/reorder', reorderHeroSlides);

adminHeroSliderRouter.route('/:id')
  .all(validateObjectId('id'))
  .put(upload.single('backgroundImage'), updateHeroSlide)
  .delete(deleteHeroSlide);
