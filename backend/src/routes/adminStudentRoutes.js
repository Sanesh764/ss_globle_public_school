import express from 'express';
import {
  getStudents,
  getStudentById,
  updateStudent,
  updateStudentStatus,
} from '../controllers/studentController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(verifyJWT, verifyAdminRole);

router.get('/', getStudents);
router.patch('/:id/status', validateObjectId('id'), updateStudentStatus);
router
  .route('/:id')
  .all(validateObjectId('id'))
  .get(getStudentById)
  .patch(updateStudent);

export default router;
