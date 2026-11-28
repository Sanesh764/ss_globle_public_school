import { body, validationResult } from 'express-validator';
import {
  CLASS_OPTIONS,
  EMAIL_MAX_LENGTH,
  GENDER_OPTIONS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  isValidIndianContactNumber,
  isValidNonFutureIndiaDate,
  normalizeIndianContactNumber,
} from '../models/StudentApplication.js';
import { cleanupTempUploadedFile } from '../middleware/uploadMiddleware.js';

export const ALLOWED_REGISTRATION_FIELDS = [
  'fullName',
  'dateOfBirth',
  'gender',
  'fatherName',
  'motherName',
  'contactNumber',
  'classApplyingFor',
  'email',
];

const cleanupRequestTempPhoto = async (req) => {
  if (req.file) {
    await cleanupTempUploadedFile(req.file).catch(() => {});
    req.file = undefined;
  }
};

const rejectUnexpectedFields = async (req, res, next) => {
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    await cleanupRequestTempPhoto(req);
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: 'Invalid registration payload',
    });
  }

  const unexpectedFields = Object.keys(req.body).filter(
    (field) => !ALLOWED_REGISTRATION_FIELDS.includes(field)
  );

  if (unexpectedFields.length > 0) {
    await cleanupRequestTempPhoto(req);
    return res.status(400).json({
      success: false,
      statusCode: 400,
      message: `Unexpected field(s) in registration request: ${unexpectedFields.join(', ')}`,
    });
  }

  next();
};

export const validatePublicRegistration = [
  rejectUnexpectedFields,
  body('fullName')
    .isString()
    .withMessage('Student full name must be a text string')
    .trim()
    .notEmpty()
    .withMessage('Student full name is required')
    .bail()
    .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
    .withMessage(`Student full name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`),
  body('dateOfBirth')
    .notEmpty()
    .withMessage('Date of birth is required')
    .bail()
    .custom((value) => {
      if (typeof value !== 'string' && !(value instanceof Date)) {
        throw new Error('Date of birth must be a valid date');
      }
      if (typeof value === 'string' && !value.trim()) {
        throw new Error('Date of birth is required');
      }
      if (!isValidNonFutureIndiaDate(value)) {
        throw new Error('Date of birth must be a valid date and cannot be in the future');
      }
      return true;
    }),
  body('gender')
    .isString()
    .withMessage('Gender must be a text string')
    .trim()
    .isIn(GENDER_OPTIONS)
    .withMessage('Gender must be Male, Female, or Other'),
  body('fatherName')
    .isString()
    .withMessage("Father's name must be a text string")
    .trim()
    .notEmpty()
    .withMessage("Father's name is required")
    .bail()
    .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
    .withMessage(`Father's name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`),
  body('motherName')
    .isString()
    .withMessage("Mother's name must be a text string")
    .trim()
    .notEmpty()
    .withMessage("Mother's name is required")
    .bail()
    .isLength({ min: NAME_MIN_LENGTH, max: NAME_MAX_LENGTH })
    .withMessage(`Mother's name must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters`),
  body('contactNumber')
    .isString()
    .withMessage('Contact number must be provided as a string')
    .trim()
    .notEmpty()
    .withMessage('Contact number is required')
    .bail()
    .custom((value) => {
      if (!isValidIndianContactNumber(value)) {
        throw new Error('Please provide a valid 10-digit Indian mobile number (with optional +91)');
      }
      return true;
    })
    .customSanitizer((value) => normalizeIndianContactNumber(value) ?? value.trim()),
  body('classApplyingFor')
    .isString()
    .withMessage('Class selection must be a text string')
    .trim()
    .isIn(CLASS_OPTIONS)
    .withMessage('Class applying for must be between Class 1 and Class 12'),
  body('email')
    .optional({ values: 'falsy' })
    .isString()
    .withMessage('Email must be a text string')
    .trim()
    .isLength({ max: EMAIL_MAX_LENGTH })
    .withMessage(`Email address must not exceed ${EMAIL_MAX_LENGTH} characters`)
    .bail()
    .isEmail()
    .withMessage('Please provide a valid email address')
    .customSanitizer((value) => value.toLowerCase()),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      await cleanupRequestTempPhoto(req);
      return res.status(400).json({
        success: false,
        statusCode: 400,
        errors: errors.array(),
        message: errors.array()[0].msg,
      });
    }
    next();
  },
];
