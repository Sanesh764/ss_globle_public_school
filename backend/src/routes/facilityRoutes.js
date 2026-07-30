import express from 'express';
import {
  getPublicFacilities,
  getAdminFacilities,
  createFacility,
  updateFacility,
  deleteFacility,
} from '../controllers/facilityController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifySuperAdmin } from '../middleware/admin.middleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

export const publicFacilityRouter = express.Router();
publicFacilityRouter.get('/', getPublicFacilities);

export const adminFacilityRouter = express.Router();
adminFacilityRouter.use(verifyJWT, verifySuperAdmin);

adminFacilityRouter.get('/', getAdminFacilities);
adminFacilityRouter.post('/', upload.single('image'), createFacility);
adminFacilityRouter
  .route('/:id')
  .all(validateObjectId('id'))
  .put(upload.single('image'), updateFacility)
  .delete(deleteFacility);
