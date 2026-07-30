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
  const { email, username, password } = req.body;
  const loginInput = (email || username || '').trim().toLowerCase();

  if (!loginInput || !password) {
    throw new ApiError(400, 'Please provide both email/username and password');
  }

  let searchCriteria = [{ email: loginInput }, { username: loginInput }];
  if (loginInput === 'staff') {
    searchCriteria.push({ email: 'staff@ssglobal.edu.in' });
  } else if (loginInput === 'admin') {
    searchCriteria.push({ email: process.env.ADMIN_EMAIL || 'admin@ssglobalpublicschool.edu.in' });
  }

  // Explicitly select password since select: false in schema
  const admin = await Admin.findOne({ $or: searchCriteria }).select('+password');

  if (!admin || !(await bcrypt.compare(password, admin.password))) {
    throw new ApiError(401, 'Invalid email or password credentials');
  }

  if (admin.isActive === false) {
    throw new ApiError(403, 'Your account has been deactivated. Please contact Super Admin.');
  }

  const token = generateToken(res, admin._id);

  const adminResponse = {
    _id: admin._id,
    name: admin.name,
    username: admin.username || admin.email.split('@')[0],
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
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

  const adminResponse = {
    _id: admin._id,
    name: admin.name,
    username: admin.username || admin.email.split('@')[0],
    email: admin.email,
    role: admin.role,
    isActive: admin.isActive,
    createdAt: admin.createdAt,
  };

  res.status(200).json(new ApiResponse(200, { admin: adminResponse }, 'Admin profile retrieved'));
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

// ====================================================
// SUPER ADMIN OWN PROFILE CONTROLLERS
// ====================================================

// @desc    Get Super Admin own profile
// @route   GET /api/admin/profile
// @access  Private/SuperAdmin
export const getSuperAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (!admin) throw new ApiError(404, 'Super Admin profile not found');

  const profile = {
    _id: admin._id,
    name: admin.name,
    username: admin.username || admin.email.split('@')[0],
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt,
  };

  res.status(200).json(new ApiResponse(200, { profile }, 'Profile retrieved successfully'));
});

// @desc    Update Super Admin own profile
// @route   PUT /api/admin/profile
// @access  Private/SuperAdmin
export const updateSuperAdminProfile = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.admin._id);
  if (!admin) throw new ApiError(404, 'Super Admin profile not found');

  const { name, username, email } = req.body;

  if (email && email.trim().toLowerCase() !== admin.email.toLowerCase()) {
    const emailExists = await Admin.findOne({ email: email.trim().toLowerCase(), _id: { $ne: admin._id } });
    if (emailExists) throw new ApiError(400, 'An admin account with this email already exists');
    admin.email = email.trim().toLowerCase();
  }

  if (username && username.trim().toLowerCase() !== (admin.username || '').toLowerCase()) {
    const usernameExists = await Admin.findOne({ username: username.trim().toLowerCase(), _id: { $ne: admin._id } });
    if (usernameExists) throw new ApiError(400, 'An admin account with this username already exists');
    admin.username = username.trim().toLowerCase();
  }

  if (name && name.trim()) admin.name = name.trim();

  await admin.save();

  const profile = {
    _id: admin._id,
    name: admin.name,
    username: admin.username || admin.email.split('@')[0],
    email: admin.email,
    role: admin.role,
    createdAt: admin.createdAt,
  };

  res.status(200).json(new ApiResponse(200, { profile }, 'Profile updated successfully'));
});

// @desc    Update Super Admin own password
// @route   PUT /api/admin/profile/password
// @access  Private/SuperAdmin
export const updateSuperAdminPassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword) throw new ApiError(400, 'Current password is required');
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'New password must be at least 8 characters long');
  }
  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    throw new ApiError(400, 'New password and confirm password do not match');
  }

  const admin = await Admin.findById(req.admin._id).select('+password');
  if (!admin) throw new ApiError(404, 'Super Admin profile not found');

  const isMatch = await bcrypt.compare(currentPassword, admin.password);
  if (!isMatch) throw new ApiError(401, 'Current password is incorrect');

  admin.password = newPassword;
  await admin.save();

  res.status(200).json(new ApiResponse(200, null, 'Password updated successfully. Please log in again.'));
});

// ====================================================
// SUPER ADMIN STAFF USER MANAGEMENT CONTROLLERS
// ====================================================

// @desc    Get all staff admins
// @route   GET /api/admin/users
// @access  Private/SuperAdmin
export const getStaffAdmins = asyncHandler(async (req, res) => {
  const rawUsers = await Admin.find({ _id: { $ne: req.admin._id } }).select('-password').sort({ createdAt: -1 });
  const users = rawUsers.map((u) => ({
    _id: u._id,
    name: u.name,
    username: u.username || u.email.split('@')[0],
    email: u.email,
    role: u.role,
    isActive: u.isActive,
    createdAt: u.createdAt,
  }));

  res.status(200).json(new ApiResponse(200, { count: users.length, users }, 'Admin users retrieved'));
});

// @desc    Create new Staff Admin
// @route   POST /api/admin/users
// @access  Private/SuperAdmin
export const createStaffAdmin = asyncHandler(async (req, res) => {
  const { name, username, email, password, role } = req.body;

  if (!name || !name.trim()) throw new ApiError(400, 'Full name is required');
  if (!email || !email.trim()) throw new ApiError(400, 'Email address is required');
  if (!password || password.length < 8) throw new ApiError(400, 'Password must be at least 8 characters long');

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = (username || email.split('@')[0]).trim().toLowerCase();

  const existingEmail = await Admin.findOne({ email: cleanEmail });
  if (existingEmail) throw new ApiError(400, 'An admin account with this email already exists');

  const existingUsername = await Admin.findOne({ username: cleanUsername });
  if (existingUsername) throw new ApiError(400, 'An admin account with this username already exists');

  const newUser = await Admin.create({
    name: name.trim(),
    username: cleanUsername,
    email: cleanEmail,
    password: password,
    role: role === 'superadmin' ? 'superadmin' : 'staff',
  });

  const userResponse = {
    _id: newUser._id,
    name: newUser.name,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    isActive: newUser.isActive,
    createdAt: newUser.createdAt,
  };

  res.status(201).json(new ApiResponse(201, { user: userResponse }, 'Staff account created successfully'));
});

// @desc    Update Staff Admin user
// @route   PUT /api/admin/users/:id
// @access  Private/SuperAdmin
export const updateStaffAdmin = asyncHandler(async (req, res) => {
  const user = await Admin.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Staff account not found');

  const { name, username, email, role, isActive } = req.body;

  if (email && email.trim().toLowerCase() !== user.email.toLowerCase()) {
    const existingEmail = await Admin.findOne({ email: email.trim().toLowerCase(), _id: { $ne: user._id } });
    if (existingEmail) throw new ApiError(400, 'An admin account with this email already exists');
    user.email = email.trim().toLowerCase();
  }

  if (username && username.trim().toLowerCase() !== (user.username || '').toLowerCase()) {
    const existingUsername = await Admin.findOne({ username: username.trim().toLowerCase(), _id: { $ne: user._id } });
    if (existingUsername) throw new ApiError(400, 'An admin account with this username already exists');
    user.username = username.trim().toLowerCase();
  }

  if (name && name.trim()) user.name = name.trim();
  if (role) user.role = role;
  if (isActive !== undefined) user.isActive = isActive === 'true' || isActive === true;

  await user.save();

  const userResponse = {
    _id: user._id,
    name: user.name,
    username: user.username || user.email.split('@')[0],
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    updatedAt: user.updatedAt,
  };

  res.status(200).json(new ApiResponse(200, { user: userResponse }, 'Staff account updated successfully'));
});

// @desc    Reset Staff Admin password
// @route   PUT /api/admin/users/:id/reset-password
// @route   PATCH /api/admin/users/:id/reset-password
// @access  Private/SuperAdmin
export const resetStaffAdminPassword = asyncHandler(async (req, res) => {
  const user = await Admin.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Staff account not found');

  const { newPassword, confirmPassword } = req.body;
  if (!newPassword || newPassword.length < 8) {
    throw new ApiError(400, 'Password must be at least 8 characters long');
  }
  if (confirmPassword !== undefined && newPassword !== confirmPassword) {
    throw new ApiError(400, 'New password and confirm password do not match');
  }

  user.password = newPassword;
  await user.save();

  res.status(200).json(new ApiResponse(200, null, 'Password reset successfully'));
});

// @desc    Delete Staff Admin user
// @route   DELETE /api/admin/users/:id
// @access  Private/SuperAdmin
export const deleteStaffAdmin = asyncHandler(async (req, res) => {
  const user = await Admin.findById(req.params.id);
  if (!user) throw new ApiError(404, 'Staff account not found');

  if (user._id.toString() === req.admin._id.toString()) {
    throw new ApiError(400, 'You cannot delete your own admin account');
  }

  await user.deleteOne();
  res.status(200).json(new ApiResponse(200, null, 'Staff account deleted successfully'));
});
