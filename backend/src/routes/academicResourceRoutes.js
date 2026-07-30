import express from 'express';
import {
  getPublicAcademicResources,
  getAdminAcademicResources,
  createAcademicResource,
  updateAcademicResource,
  deleteAcademicResource,
} from '../controllers/academicResourceController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { upload } from '../middleware/uploadMiddleware.js';

export const publicAcademicResourceRouter = express.Router();
publicAcademicResourceRouter.get('/', getPublicAcademicResources);

export const adminAcademicResourceRouter = express.Router();
adminAcademicResourceRouter.use(verifyJWT, verifyAdminRole);

adminAcademicResourceRouter.route('/')
  .get(getAdminAcademicResources)
  .post(upload.single('file'), createAcademicResource);

adminAcademicResourceRouter.route('/:id')
  .all(validateObjectId('id'))
  .put(upload.single('file'), updateAcademicResource)
  .delete(deleteAcademicResource);
