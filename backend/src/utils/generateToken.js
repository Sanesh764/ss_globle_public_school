import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'ss_global_public_school_super_secret_jwt_key_2026', {
    expiresIn: '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';

  // Set JWT as HTTP-only cookie
  // Note: For cross-domain (AWS Amplify frontend + Render backend), sameSite MUST be 'none' and secure MUST be true in production
  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export default generateToken;
