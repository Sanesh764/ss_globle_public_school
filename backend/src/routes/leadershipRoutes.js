import express from 'express';
import {
  getPublicLeadership,
  getAdminLeadership,
  createLeadership,
  updateLeadership,
  deleteLeadership,
} from '../controllers/leadershipController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { upload } from '../middleware/uploadMiddleware.js';

export const publicLeadershipRouter = express.Router();
publicLeadershipRouter.get('/', getPublicLeadership);

export const adminLeadershipRouter = express.Router();
adminLeadershipRouter.use(verifyJWT, verifyAdminRole);

adminLeadershipRouter.route('/')
  .get(getAdminLeadership)
  .post(upload.single('image'), createLeadership);

adminLeadershipRouter.route('/:id')
  .all(validateObjectId('id'))
  .put(upload.single('image'), updateLeadership)
  .delete(deleteLeadership);
