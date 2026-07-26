import jwt from 'jsonwebtoken';
import Admin from '../models/Admin.js';

export const protectAdmin = async (req, res, next) => {
  let token;

  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'ss_global_public_school_super_secret_jwt_key_2026');
    req.admin = await Admin.findById(decoded.userId).select('-password');

    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Not authorized, admin user not found' });
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware Error]', error.message);
    res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
  }
};
