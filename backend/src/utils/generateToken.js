import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'ss_global_public_school_super_secret_jwt_key_2026', {
    expiresIn: '7d',
  });

  const isProduction = process.env.NODE_ENV === 'production';
  const requestOrigin = res.req?.headers?.origin || '';
  
  // Secure cookies require HTTPS. Enable secure & sameSite:'none' ONLY for HTTPS cross-site origins (AWS Amplify / Custom Domain).
  // Use secure: false & sameSite: 'lax' for HTTP localhost development.
  const isHttpsOrigin = requestOrigin.startsWith('https://');
  const isSecureCookie = isProduction && isHttpsOrigin;

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: isSecureCookie ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return token;
};

export default generateToken;
