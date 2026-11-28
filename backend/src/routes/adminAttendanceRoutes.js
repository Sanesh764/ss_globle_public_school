import express from 'express';
import {
  getDailyAttendanceSheet,
  submitBulkAttendance,
  getMonthlyAttendanceSummary,
  getStudentAttendanceHistory,
} from '../controllers/attendanceController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.use(verifyJWT, verifyAdminRole);

router.get('/sheet', getDailyAttendanceSheet);
router.get('/summary', getMonthlyAttendanceSummary);
router.get('/student/:studentId', validateObjectId('studentId'), getStudentAttendanceHistory);
router.post('/bulk', submitBulkAttendance);

export default router;
