import express from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { validateNotice } from '../validators/noticeValidator.js';

const router = express.Router();

router.route('/')
  .get(getNotices)
  .post(verifyJWT, verifyAdminRole, validateNotice, createNotice);

router.route('/:id')
  .all(validateObjectId('id'))
  .get(getNoticeById)
  .put(verifyJWT, verifyAdminRole, validateNotice, updateNotice)
  .delete(verifyJWT, verifyAdminRole, deleteNotice);

export default router;
