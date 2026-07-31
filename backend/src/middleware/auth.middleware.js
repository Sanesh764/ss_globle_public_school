import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';
import { ApiError } from '../utils/ApiError.js';
import logger from '../utils/logger.js';

export const verifyJWT = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      logger.security('UNAUTHORIZED_ACCESS_ATTEMPT', { path: req.originalUrl, ip: req.ip });
      throw new ApiError(401, 'Unauthorized request - Token missing or expired');
    }

    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET || 'ss_global_public_school_super_secret_jwt_key_2026'
    );

    const admin = await Admin.findById(decodedToken.userId);

    if (!admin) {
      logger.security('INVALID_TOKEN_USER_NOT_FOUND', { userId: decodedToken.userId, ip: req.ip });
      throw new ApiError(401, 'Unauthorized request - Account no longer exists');
    }

    req.admin = admin;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Your session has expired. Please sign in again.'));
    }
    if (error.name === 'JsonWebTokenError') {
      return next(new ApiError(401, 'Invalid authentication token'));
    }
    next(error);
  }
};

// Safe JWT middleware for logout route (does not block on expired/missing token)
export const verifyJWTForLogout = async (req, res, next) => {
  try {
    let token;

    if (req.cookies && req.cookies.jwt) {
      token = req.cookies.jwt;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decodedToken = jwt.verify(
          token,
          process.env.JWT_SECRET || 'ss_global_public_school_super_secret_jwt_key_2026'
        );
        const admin = await Admin.findById(decodedToken.userId);
        if (admin) req.admin = admin;
      } catch (err) {
        // Silently ignore expired or invalid token errors during logout
      }
    }
    next();
  } catch (error) {
    next();
  }
};

// Backwards compatibility alias
export const protectAdmin = verifyJWT;
