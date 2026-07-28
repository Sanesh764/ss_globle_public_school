import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const verifyAdminRole = (req, res, next) => {
  if (!req.admin || req.admin.role !== 'admin') {
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
