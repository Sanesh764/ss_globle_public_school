import express from 'express';
import {
  submitContactMessage,
  getContactMessages,
  getContactMessageById,
  markMessageAsRead,
  markMessageAsReplied,
  deleteContactMessage,
} from '../controllers/contactController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { contactSubmissionLimiter } from '../middleware/rateLimiter.middleware.js';

export const publicContactRouter = express.Router();
publicContactRouter.post('/', contactSubmissionLimiter, submitContactMessage);

export const adminContactRouter = express.Router();
adminContactRouter.use(verifyJWT, verifyAdminRole);

adminContactRouter.get('/', getContactMessages);

adminContactRouter.route('/:id')
  .all(validateObjectId('id'))
  .get(getContactMessageById)
  .delete(deleteContactMessage);

adminContactRouter.route('/:id/read')
  .all(validateObjectId('id'))
  .patch(markMessageAsRead)
  .put(markMessageAsRead);

adminContactRouter.route('/:id/replied')
  .all(validateObjectId('id'))
  .patch(markMessageAsReplied)
  .put(markMessageAsReplied);
