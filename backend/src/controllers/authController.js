import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import generateToken from '../utils/generateToken.js';

// @desc    Auth Admin & get token
// @route   POST /api/admin/login
// @access  Public
export const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });

    if (admin && (await bcrypt.compare(password, admin.password))) {
      const token = generateToken(res, admin._id);

      res.json({
        success: true,
        message: 'Login successful',
        token,
        admin: {
          _id: admin._id,
          name: admin.name,
          email: admin.email,
          role: admin.role,
        },
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get Admin profile
// @route   GET /api/admin/me
// @access  Private/Admin
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin._id).select('-password');
    if (!admin) {
      return res.status(404).json({ success: false, message: 'Admin not found' });
    }
    res.json({ success: true, admin });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Logout admin / clear cookie
// @route   POST /api/admin/logout
// @access  Private/Admin
export const logoutAdmin = async (req, res) => {
  res.cookie('jwt', '', {
    httpOnly: true,
    expires: new Date(0),
  });
  res.json({ success: true, message: 'Logged out successfully' });
};
