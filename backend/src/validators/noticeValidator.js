import { body, validationResult } from 'express-validator';

export const validateNotice = [
  body('title').trim().notEmpty().withMessage('Notice title is required'),
  body('description').trim().notEmpty().withMessage('Notice description is required'),
  body('category').optional().isIn(['Academic', 'Exam', 'Holiday', 'General', 'Admission']).withMessage('Invalid category'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array(), message: errors.array()[0].msg });
    }
    next();
  },
];
