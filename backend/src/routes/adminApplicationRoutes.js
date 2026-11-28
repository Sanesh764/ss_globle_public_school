import express from 'express';
import {
  getStudentApplications,
  getStudentApplicationById,
  updateStudentApplication,
  approveStudentApplication,
  requestApplicationCorrection,
  rejectStudentApplication,
} from '../controllers/applicationController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(verifyJWT, verifyAdminRole);

router.get('/', getStudentApplications);
router.patch('/:id/approve', validateObjectId('id'), approveStudentApplication);
router.patch(
  '/:id/request-correction',
  validateObjectId('id'),
  requestApplicationCorrection
);
router.patch('/:id/reject', validateObjectId('id'), rejectStudentApplication);
router
  .route('/:id')
  .all(validateObjectId('id'))
  .get(getStudentApplicationById)
  .patch(updateStudentApplication);

export default router;
