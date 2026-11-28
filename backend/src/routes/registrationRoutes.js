import express from 'express';
import { submitStudentRegistration } from '../controllers/registrationController.js';
import { validatePublicRegistration } from '../validators/registrationValidator.js';
import { registrationSubmissionLimiter } from '../middleware/rateLimiter.middleware.js';
import { studentPhotoUpload } from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/',
  registrationSubmissionLimiter,
  studentPhotoUpload,
  validatePublicRegistration,
  submitStudentRegistration
);

export default router;
