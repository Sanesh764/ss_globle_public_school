import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  const token = jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'ss_global_public_school_super_secret_jwt_key_2026',
    {
      expiresIn,
    }
  );

  const isProduction = process.env.NODE_ENV === 'production';
  const requestOrigin = res.req?.headers?.origin || '';
  
  // Secure cookies require HTTPS. Enable secure & sameSite:'none' ONLY for HTTPS cross-site origins.
  const isHttpsOrigin = requestOrigin.startsWith('https://');
  const isSecureCookie = isProduction && isHttpsOrigin;

  // Maximum lifetime of exactly 24 hours (86,400,000 milliseconds)
  const MAX_AGE_24_HOURS = 24 * 60 * 60 * 1000;

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: isSecureCookie,
    sameSite: isSecureCookie ? 'none' : 'lax',
    maxAge: MAX_AGE_24_HOURS,
  });

  return token;
};

export default generateToken;
