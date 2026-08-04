import express from 'express';
import {
  getPublicVideos,
  getPublicVideoById,
  getAdminVideos,
  getVideoStats,
  getVideoById,
  createVideo,
  updateVideo,
  deleteVideo,
  toggleVideoStatus,
  toggleVideoFeatured,
  bulkDeleteVideos,
  bulkUpdateStatus,
  reorderVideos,
} from '../controllers/videoController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

export const publicVideoRouter = express.Router();
export const adminVideoRouter = express.Router();

// ==========================================
// PUBLIC VIDEO ROUTES
// ==========================================
publicVideoRouter.get('/', getPublicVideos);
publicVideoRouter.get('/:id', validateObjectId('id'), getPublicVideoById);

// ==========================================
// ADMIN VIDEO ROUTES (Protected)
// ==========================================
adminVideoRouter.use(verifyJWT, verifyAdminRole);

adminVideoRouter.get('/stats', getVideoStats);
adminVideoRouter.put('/reorder', reorderVideos);
adminVideoRouter.post('/bulk-delete', bulkDeleteVideos);
adminVideoRouter.patch('/bulk-status', bulkUpdateStatus);

adminVideoRouter.route('/')
  .get(getAdminVideos)
  .post(createVideo);

adminVideoRouter.route('/:id')
  .all(validateObjectId('id'))
  .get(getVideoById)
  .put(updateVideo)
  .delete(deleteVideo);

adminVideoRouter.patch('/:id/toggle-status', validateObjectId('id'), toggleVideoStatus);
adminVideoRouter.patch('/:id/toggle-featured', validateObjectId('id'), toggleVideoFeatured);
