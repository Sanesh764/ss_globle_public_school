import express from 'express';
import { loginAdmin, getAdminProfile, logoutAdmin } from '../controllers/authController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { verifyAdminRole } from '../middleware/admin.middleware.js';
import { validateLogin } from '../validators/authValidator.js';

const router = express.Router();

router.post('/login', validateLogin, loginAdmin);
router.get('/me', verifyJWT, verifyAdminRole, getAdminProfile);
router.post('/logout', verifyJWT, logoutAdmin);

export default router;
