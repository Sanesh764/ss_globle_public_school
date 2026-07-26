import express from 'express';
import { loginAdmin, getAdminProfile, logoutAdmin } from '../controllers/authController.js';
import { protectAdmin } from '../middleware/authMiddleware.js';
import { validateLogin } from '../validators/authValidator.js';

const router = express.Router();

router.post('/login', validateLogin, loginAdmin);
router.get('/me', protectAdmin, getAdminProfile);
router.post('/logout', protectAdmin, logoutAdmin);

export default router;
