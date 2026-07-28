import express from 'express';
import {
  submitContactMessage,
  getContactMessages,
  deleteContactMessage,
  toggleReadMessage,
} from '../controllers/contactController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';
import { validateContactMessage } from '../validators/contactValidator.js';

const router = express.Router();

router.route('/')
  .post(validateContactMessage, submitContactMessage)
  .get(verifyJWT, verifyAdminRole, getContactMessages);

router.route('/:id')
  .all(validateObjectId('id'))
  .delete(verifyJWT, verifyAdminRole, deleteContactMessage);

router.route('/:id/read')
  .all(validateObjectId('id'))
  .put(verifyJWT, verifyAdminRole, toggleReadMessage);

export default router;
