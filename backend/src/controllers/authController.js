import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Auth Admin & get token
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Please provide both email and password');
  }

  // Explicitly select password since select: false in schema
  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw new ApiError(401, 'Invalid email or password credentials');
  }

  const token = generateToken(res, admin._id);

  const adminResponse = {
    _id: admin._id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
  };

  res.status(200).json(
    new ApiResponse(
      200,
      { token, admin: adminResponse },
      'Admin logged in successfully'
    )
  );
});

// @desc    Get Admin profile
// @route   GET /api/admin/me
// @access  Private/Admin
export const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (!admin) {
    throw new ApiError(404, 'Admin profile not found');
  }

  res.status(200).json(new ApiResponse(200, { admin }, 'Admin profile retrieved'));
});

// @desc    Logout admin / clear cookie
// @route   POST /api/admin/logout
// @access  Public/Admin (Safe Logout)
export const logoutAdmin = asyncHandler(async (req, res) => {
  const requestOrigin = req.headers?.origin || '';
  const isHttpsOrigin = requestOrigin.startsWith('https://');
  const isProduction = process.env.NODE_ENV === 'production';
  const isSecureCookie = isProduction && isHttpsOrigin;

  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isSecureCookie,
    sameSite: isSecureCookie ? 'none' : 'lax',
  });

  res.status(200).json(new ApiResponse(200, {}, 'Logged out successfully'));
});
