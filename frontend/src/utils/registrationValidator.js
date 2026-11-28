import {
  CLASS_OPTIONS,
  GENDER_OPTIONS,
  STUDENT_PHOTO_ALLOWED_MIME_TYPES,
  STUDENT_PHOTO_MAX_SIZE_BYTES,
} from './constants.js';

export const NAME_MIN_LENGTH = 2;
export const NAME_MAX_LENGTH = 100;
export const EMAIL_MAX_LENGTH = 254;

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INDIA_TIMEZONE = 'Asia/Kolkata';
const ALLOWED_CONTACT_CHARS_REGEX = /^[+\d\s()-]+$/;
const INDIAN_MOBILE_COMPACT_REGEX = /^(?:\+91)?([6-9]\d{9})$/;

const formatIndiaDateKey = (date) =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: INDIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);

export const isValidNonFutureIndiaDate = (value, referenceNow = new Date()) => {
  if (value === undefined || value === null) return false;
  if (typeof value === 'string' && !value.trim()) return false;
  if (typeof value !== 'string' && !(value instanceof Date)) return false;

  const date = value instanceof Date ? value : new Date(value);
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    return false;
  }

  return formatIndiaDateKey(date) <= formatIndiaDateKey(referenceNow);
};

export const normalizeIndianContactNumber = (value) => {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed || !ALLOWED_CONTACT_CHARS_REGEX.test(trimmed)) {
    return null;
  }
  const compact = trimmed.replace(/[\s()-]/g, '');
  const match = compact.match(INDIAN_MOBILE_COMPACT_REGEX);
  return match ? match[1] : null;
};

export const normalizeRegistrationEmail = (value) => {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase();
};

const isFileObjectLike = (file) => {
  if (!file || typeof file !== 'object') return false;
  if (typeof File !== 'undefined' && file instanceof File) return true;
  return (
    typeof file.name === 'string' &&
    typeof file.size === 'number' &&
    typeof file.type === 'string'
  );
};

export const validateStudentPhoto = (photo) => {
  if (photo === undefined || photo === null || photo === '') {
    return null;
  }

  if (!isFileObjectLike(photo)) {
    return 'Selected photograph must be a valid image file.';
  }

  const mime = (photo.type || '').toLowerCase();
  if (!STUDENT_PHOTO_ALLOWED_MIME_TYPES.includes(mime)) {
    return 'Only JPEG, PNG, and WebP photographs are allowed.';
  }

  if (photo.size <= 0) {
    return 'Selected photograph file cannot be empty.';
  }

  if (photo.size > STUDENT_PHOTO_MAX_SIZE_BYTES) {
    return 'Student photograph must not exceed 2 MB.';
  }

  return null;
};

const validateNameField = (value, label) => {
  if (typeof value !== 'string' || !value.trim()) {
    return `${label} is required`;
  }
  const trimmed = value.trim();
  if (trimmed.length < NAME_MIN_LENGTH) {
    return `${label} must be at least ${NAME_MIN_LENGTH} characters`;
  }
  if (trimmed.length > NAME_MAX_LENGTH) {
    return `${label} must not exceed ${NAME_MAX_LENGTH} characters`;
  }
  return null;
};

/**
 * Validates public student registration form values against backend-matching rules.
 *
 * @param {object} values Form values
 * @param {object} [options] Optional test overrides (e.g., { referenceNow })
 * @returns {Record<string, string>} Field-level error map (empty object when valid)
 */
export const validateStudentRegistration = (values = {}, options = {}) => {
  const errors = {};
  const referenceNow = options.referenceNow instanceof Date ? options.referenceNow : new Date();

  const fullNameError = validateNameField(values.fullName, 'Full name');
  if (fullNameError) errors.fullName = fullNameError;

  const fatherNameError = validateNameField(values.fatherName, "Father's name");
  if (fatherNameError) errors.fatherName = fatherNameError;

  const motherNameError = validateNameField(values.motherName, "Mother's name");
  if (motherNameError) errors.motherName = motherNameError;

  if (
    values.dateOfBirth === undefined ||
    values.dateOfBirth === null ||
    (typeof values.dateOfBirth === 'string' && !values.dateOfBirth.trim())
  ) {
    errors.dateOfBirth = 'Date of birth is required';
  } else if (!isValidNonFutureIndiaDate(values.dateOfBirth, referenceNow)) {
    errors.dateOfBirth = 'Date of birth must be a valid date and cannot be in the future';
  }

  const genderVal = typeof values.gender === 'string' ? values.gender.trim() : '';
  if (!genderVal || !GENDER_OPTIONS.includes(genderVal)) {
    errors.gender = 'Please select Male, Female, or Other';
  }

  if (typeof values.contactNumber !== 'string' || !values.contactNumber.trim()) {
    errors.contactNumber = 'Contact number is required';
  } else if (!normalizeIndianContactNumber(values.contactNumber)) {
    errors.contactNumber = 'Enter a valid 10-digit Indian mobile number (with optional +91)';
  }

  const classVal =
    typeof values.classApplyingFor === 'string' ? values.classApplyingFor.trim() : '';
  if (!classVal || !CLASS_OPTIONS.includes(classVal)) {
    errors.classApplyingFor = 'Please select a valid class (Class 1 to Class 12)';
  }

  if (values.email !== undefined && values.email !== null && String(values.email).trim() !== '') {
    if (typeof values.email !== 'string') {
      errors.email = 'Please provide a valid email address';
    } else {
      const normalizedEmail = normalizeRegistrationEmail(values.email);
      if (normalizedEmail.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(normalizedEmail)) {
        errors.email = 'Please provide a valid email address';
      }
    }
  }

  const photoError = validateStudentPhoto(values.photo);
  if (photoError) {
    errors.photo = photoError;
  }

  return errors;
};

export default validateStudentRegistration;
