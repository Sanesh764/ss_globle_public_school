import express from 'express';
import {
  submitContactMessage,
  getContactMessages,
  deleteContactMessage,
  toggleReadMessage,
} from '../controllers/contactController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { validateContactMessage } from '../validators/contactValidator.js';

const router = express.Router();

router.route('/')
  .post(validateContactMessage, submitContactMessage)
  .get(protectAdmin, getContactMessages);

router.route('/:id')
  .delete(protectAdmin, deleteContactMessage);

router.route('/:id/read')
  .put(protectAdmin, toggleReadMessage);

export default router;
