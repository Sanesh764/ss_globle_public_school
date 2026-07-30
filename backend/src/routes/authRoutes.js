import express from 'express';
import {
  loginAdmin,
  getAdminProfile,
  logoutAdmin,
  getSuperAdminProfile,
  updateSuperAdminProfile,
  updateSuperAdminPassword,
  getStaffAdmins,
  createStaffAdmin,
  updateStaffAdmin,
  resetStaffAdminPassword,
  deleteStaffAdmin,
} from '../controllers/authController.js';
import { verifyJWT, verifyJWTForLogout } from '../middleware/auth.middleware.js';
import { verifyAdminRole, verifySuperAdmin } from '../middleware/admin.middleware.js';
import { validateLogin } from '../validators/authValidator.js';
import { loginLimiter } from '../middleware/rateLimiter.middleware.js';
import validateObjectId from '../middleware/validateObjectId.js';

const router = express.Router();

router.post('/login', loginLimiter, validateLogin, loginAdmin);
router.get('/me', verifyJWT, verifyAdminRole, getAdminProfile);
router.post('/logout', verifyJWTForLogout, logoutAdmin);

// Super Admin Own Profile Management Routes (Restricted to Super Admin)
router.route('/profile')
  .get(verifyJWT, verifySuperAdmin, getSuperAdminProfile)
  .put(verifyJWT, verifySuperAdmin, updateSuperAdminProfile);

router.put('/profile/password', verifyJWT, verifySuperAdmin, updateSuperAdminPassword);

// Super Admin Staff User Management Routes (Restricted to Super Admin)
router.route('/users')
  .get(verifyJWT, verifySuperAdmin, getStaffAdmins)
  .post(verifyJWT, verifySuperAdmin, createStaffAdmin);

router.route('/users/:id')
  .all(verifyJWT, verifySuperAdmin, validateObjectId('id'))
  .put(updateStaffAdmin)
  .delete(deleteStaffAdmin);

router.put('/users/:id/reset-password', verifyJWT, verifySuperAdmin, validateObjectId('id'), resetStaffAdminPassword);
router.patch('/users/:id/reset-password', verifyJWT, verifySuperAdmin, validateObjectId('id'), resetStaffAdminPassword);

export default router;
