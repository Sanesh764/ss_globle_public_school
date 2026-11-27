import { body, validationResult } from 'express-validator';

export const validateLogin = [
  body().custom((_, { req }) => {
    const hasEmail = req.body?.email !== undefined && req.body?.email !== null;
    const hasUsername = req.body?.username !== undefined && req.body?.username !== null;

    if (!hasEmail && !hasUsername) {
      throw new Error('Please provide an email address or username');
    }

    if (hasEmail && typeof req.body.email !== 'string') {
      throw new Error('Email or username must be a text string');
    }
    if (hasUsername && typeof req.body.username !== 'string') {
      throw new Error('Username must be a text string');
    }

    const emailStr = hasEmail ? req.body.email.trim() : '';
    const usernameStr = hasUsername ? req.body.username.trim() : '';
    const identifier = emailStr || usernameStr;

    if (!identifier) {
      throw new Error('Email address or username cannot be empty or whitespace only');
    }

    if (identifier.length > 100) {
      throw new Error('Email address or username is too long (maximum 100 characters)');
    }

    if (identifier.includes('@')) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(identifier)) {
        throw new Error('Please provide a valid email address');
      }
    } else {
      const usernameRegex = /^[a-zA-Z0-9._-]+$/;
      if (!usernameRegex.test(identifier)) {
        throw new Error('Username must contain only letters, numbers, dots, hyphens, and underscores');
      }
    }

    return true;
  }),
  body('password')
    .exists({ checkFalsy: false })
    .withMessage('Password is required')
    .bail()
    .custom((value) => {
      if (typeof value !== 'string') {
        throw new Error('Password must be a text string');
      }
      if (!value.trim()) {
        throw new Error('Password cannot be empty or whitespace only');
      }
      if (value.length > 200) {
        throw new Error('Password is too long (maximum 200 characters)');
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
        message: errors.array()[0].msg,
      });
    }
    next();
  },
];
