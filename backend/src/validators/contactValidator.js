import { body, validationResult } from 'express-validator';

export const validateContactMessage = [
  body('name').trim().notEmpty().withMessage('Full Name is required'),
  body('email').isEmail().withMessage('Valid email address is required'),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('message').trim().notEmpty().withMessage('Message content is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array(), message: errors.array()[0].msg });
    }
    next();
  },
];
