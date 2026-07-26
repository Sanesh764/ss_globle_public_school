import express from 'express';
import {
  getNotices,
  getNoticeById,
  createNotice,
  updateNotice,
  deleteNotice,
} from '../controllers/noticeController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { validateNotice } from '../validators/noticeValidator.js';

const router = express.Router();

router.route('/')
  .get(getNotices)
  .post(protectAdmin, validateNotice, createNotice);

router.route('/:id')
  .get(getNoticeById)
  .put(protectAdmin, validateNotice, updateNotice)
  .delete(protectAdmin, deleteNotice);

export default router;
