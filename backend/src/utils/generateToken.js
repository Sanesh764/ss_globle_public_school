import jwt from 'jsonwebtoken';

const generateToken = (res, userId) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('FATAL: JWT_SECRET environment variable is missing. Authentication cannot function securely.');
  }

  const token = jwt.sign(
    { userId },
    jwtSecret,
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
