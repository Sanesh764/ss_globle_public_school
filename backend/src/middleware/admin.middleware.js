import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

// Verify user is authenticated admin (superadmin, admin, or staff)
export const verifyAdminRole = (req, res, next) => {
  const role = (req.admin?.role || '').toString().toLowerCase().replace(/_/g, '');
  if (!req.admin || !['superadmin', 'admin', 'staff'].includes(role)) {
    logger.security('FORBIDDEN_ROLE_ACCESS', {
      user: req.admin?._id,
      role: req.admin?.role,
      path: req.originalUrl,
      ip: req.ip,
    });
    throw new ApiError(403, 'Forbidden - You do not have administrator permissions');
  }
  next();
};

// Verify user is Super Admin (Owner access)
export const verifySuperAdmin = (req, res, next) => {
  const role = (req.admin?.role || '').toString().toLowerCase().replace(/_/g, '');
  if (!req.admin || (role !== 'superadmin' && role !== 'admin')) {
    logger.security('FORBIDDEN_SUPERADMIN_ACCESS', {
      user: req.admin?._id,
      role: req.admin?.role,
      path: req.originalUrl,
      ip: req.ip,
    });
    throw new ApiError(403, 'Access Denied - Super Admin permissions required');
  }
  next();
};

// Alias for backwards compatibility
export const verifyStaffAdmin = verifyAdminRole;
