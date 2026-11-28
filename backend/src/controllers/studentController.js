import Student from '../models/Student.js';
import {
  CLASS_OPTIONS,
  EMAIL_MAX_LENGTH,
  GENDER_OPTIONS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  isValidNonFutureIndiaDate,
  normalizeIndianContactNumber,
} from '../models/StudentApplication.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 15;
export const MAX_LIMIT = 50;
const MAX_SEARCH_LENGTH = 100;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const EDITABLE_STUDENT_FIELDS = [
  'fullName',
  'dateOfBirth',
  'gender',
  'fatherName',
  'motherName',
  'contactNumber',
  'className',
  'email',
];

const LIST_PROJECTION = {
  _id: 1,
  fullName: 1,
  admissionNumber: 1,
  applicationNumber: 1,
  className: 1,
  contactNumber: 1,
  'photo.url': 1,
  isActive: 1,
  admittedAt: 1,
  createdAt: 1,
};

const DETAIL_PROJECTION = {
  _id: 1,
  fullName: 1,
  dateOfBirth: 1,
  gender: 1,
  fatherName: 1,
  motherName: 1,
  contactNumber: 1,
  email: 1,
  className: 1,
  'photo.url': 1,
  admissionNumber: 1,
  applicationNumber: 1,
  admittedBy: 1,
  admittedAt: 1,
  isActive: 1,
  createdAt: 1,
  updatedAt: 1,
};

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const parsePositiveIntParam = (rawValue, paramName, defaultValue, maxValue = Infinity) => {
  if (rawValue === undefined || rawValue === '') {
    return defaultValue;
  }
  const str = String(rawValue).trim();
  if (!/^\d+$/.test(str)) {
    throw new ApiError(400, `Invalid ${paramName} parameter. Must be a positive integer.`);
  }
  const parsed = Number.parseInt(str, 10);
  if (parsed < 1 || parsed > maxValue) {
    const rangeMsg =
      maxValue === Infinity
        ? 'greater than or equal to 1'
        : `between 1 and ${maxValue}`;
    throw new ApiError(400, `Invalid ${paramName} parameter. Must be ${rangeMsg}.`);
  }
  return parsed;
};

const parseBooleanFilterParam = (rawValue, paramName) => {
  if (rawValue === undefined || rawValue === null) {
    return undefined;
  }
  const normalized = String(rawValue).trim();
  if (normalized === '') {
    return undefined;
  }
  if (normalized === 'true') {
    return true;
  }
  if (normalized === 'false') {
    return false;
  }
  throw new ApiError(400, `Invalid ${paramName} filter. Allowed values: true, false.`);
};

const formatSafeStudentListItem = (student) => ({
  _id: student._id,
  fullName: student.fullName,
  admissionNumber: student.admissionNumber ?? null,
  applicationNumber: student.applicationNumber ?? null,
  className: student.className,
  contactNumber: student.contactNumber,
  photo: {
    url: student.photo?.url || '',
  },
  isActive: Boolean(student.isActive),
  admittedAt: student.admittedAt,
  createdAt: student.createdAt,
});

/**
 * @desc    List permanent admitted students with search, class/active filters, and pagination
 * @route   GET /api/admin/students
 * @access  Private (superadmin, admin, staff)
 */
export const getStudents = asyncHandler(async (req, res) => {
  const page = parsePositiveIntParam(req.query.page, 'page', DEFAULT_PAGE);
  const limit = parsePositiveIntParam(req.query.limit, 'limit', DEFAULT_LIMIT, MAX_LIMIT);

  const filter = {};

  if (req.query.className !== undefined && String(req.query.className).trim() !== '') {
    const className = String(req.query.className).trim();
    if (!CLASS_OPTIONS.includes(className)) {
      throw new ApiError(
        400,
        'Invalid className filter. Must be between Class 1 and Class 12.'
      );
    }
    filter.className = className;
  }

  const activeFilter = parseBooleanFilterParam(req.query.isActive, 'isActive');
  if (activeFilter !== undefined) {
    filter.isActive = activeFilter;
  }

  if (req.query.search !== undefined && String(req.query.search).trim() !== '') {
    const rawSearch = String(req.query.search).trim().slice(0, MAX_SEARCH_LENGTH);
    const safeRegex = new RegExp(escapeRegex(rawSearch), 'i');
    filter.$or = [
      { fullName: safeRegex },
      { contactNumber: safeRegex },
      { admissionNumber: safeRegex },
      { applicationNumber: safeRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const [totalRecords, students] = await Promise.all([
    Student.countDocuments(filter),
    Student.find(filter, LIST_PROJECTION)
      .sort({ admittedAt: -1, _id: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.ceil(totalRecords / limit);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        students: students.map(formatSafeStudentListItem),
        pagination: {
          totalRecords,
          currentPage: page,
          pageSize: limit,
          totalPages,
        },
      },
      'Students fetched successfully.'
    )
  );
});

const formatSafeAdmittedBy = (admittedBy) => {
  if (!admittedBy || typeof admittedBy !== 'object') return null;
  return {
    name: admittedBy.name ?? null,
    email: admittedBy.email ?? null,
    role: admittedBy.role ?? null,
  };
};

const formatSafeStudentDetail = (student) => ({
  _id: student._id,
  fullName: student.fullName,
  dateOfBirth: student.dateOfBirth,
  gender: student.gender,
  fatherName: student.fatherName,
  motherName: student.motherName,
  contactNumber: student.contactNumber,
  email: student.email ?? null,
  className: student.className,
  photo: {
    url: student.photo?.url || '',
  },
  admissionNumber: student.admissionNumber ?? null,
  applicationNumber: student.applicationNumber ?? null,
  isActive: Boolean(student.isActive),
  admittedAt: student.admittedAt,
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
  admittedBy: formatSafeAdmittedBy(student.admittedBy),
});

/**
 * @desc    Fetch complete details of a single permanent Student record
 * @route   GET /api/admin/students/:id
 * @access  Private (superadmin, admin, staff)
 */
export const getStudentById = asyncHandler(async (req, res) => {
  const student = await Student.findById(req.params.id, DETAIL_PROJECTION)
    .populate('admittedBy', 'name email role')
    .lean();

  if (!student) {
    throw new ApiError(404, 'Student not found.');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { student: formatSafeStudentDetail(student) },
      'Student fetched successfully.'
    )
  );
});

const validateAndNormalizeStudentUpdate = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Invalid student update payload.');
  }

  const keys = Object.keys(body);
  if (keys.length === 0) {
    throw new ApiError(400, 'At least one editable student field must be provided.');
  }

  for (const key of keys) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new ApiError(400, `Invalid operator or field key '${key}' in update payload.`);
    }
    if (!EDITABLE_STUDENT_FIELDS.includes(key)) {
      throw new ApiError(400, `Field '${key}' cannot be modified.`);
    }
  }

  const setFields = {};
  const unsetFields = {};

  for (const nameField of ['fullName', 'fatherName', 'motherName']) {
    if (Object.prototype.hasOwnProperty.call(body, nameField)) {
      const val = body[nameField];
      if (typeof val !== 'string' || !val.trim()) {
        throw new ApiError(400, `${nameField} is required and must be a non-empty string.`);
      }
      const trimmed = val.trim();
      if (trimmed.length < NAME_MIN_LENGTH || trimmed.length > NAME_MAX_LENGTH) {
        throw new ApiError(
          400,
          `${nameField} must be between ${NAME_MIN_LENGTH} and ${NAME_MAX_LENGTH} characters.`
        );
      }
      setFields[nameField] = trimmed;
    }
  }

  if (Object.prototype.hasOwnProperty.call(body, 'dateOfBirth')) {
    const val = body.dateOfBirth;
    if (
      (typeof val !== 'string' && !(val instanceof Date)) ||
      (typeof val === 'string' && !val.trim()) ||
      !isValidNonFutureIndiaDate(val)
    ) {
      throw new ApiError(400, 'Date of birth must be a valid date and cannot be in the future.');
    }
    setFields.dateOfBirth = new Date(val);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'gender')) {
    const val = body.gender;
    if (typeof val !== 'string' || !GENDER_OPTIONS.includes(val.trim())) {
      throw new ApiError(400, 'Gender must be Male, Female, or Other.');
    }
    setFields.gender = val.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'className')) {
    const val = body.className;
    if (typeof val !== 'string' || !CLASS_OPTIONS.includes(val.trim())) {
      throw new ApiError(400, 'Class must be between Class 1 and Class 12.');
    }
    setFields.className = val.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'contactNumber')) {
    const normalizedPhone = normalizeIndianContactNumber(body.contactNumber);
    if (!normalizedPhone) {
      throw new ApiError(
        400,
        'Please provide a valid 10-digit Indian mobile number (with optional +91).'
      );
    }
    setFields.contactNumber = normalizedPhone;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'email')) {
    const val = body.email;
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
      unsetFields.email = 1;
    } else if (typeof val !== 'string') {
      throw new ApiError(400, 'Email must be a text string.');
    } else {
      const normalizedEmail = val.trim().toLowerCase();
      if (normalizedEmail.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(normalizedEmail)) {
        throw new ApiError(400, 'Please provide a valid email address.');
      }
      setFields.email = normalizedEmail;
    }
  }

  return { setFields, unsetFields };
};

/**
 * @desc    Update editable fields of a permanent Student record
 * @route   PATCH /api/admin/students/:id
 * @access  Private (superadmin, admin, staff)
 */
export const updateStudent = asyncHandler(async (req, res) => {
  const { setFields, unsetFields } = validateAndNormalizeStudentUpdate(req.body);

  const updateOp = {};
  if (Object.keys(setFields).length > 0) {
    updateOp.$set = setFields;
  }
  if (Object.keys(unsetFields).length > 0) {
    updateOp.$unset = unsetFields;
  }

  let updatedStudent;
  try {
    updatedStudent = await Student.findByIdAndUpdate(req.params.id, updateOp, {
      new: true,
      runValidators: true,
      projection: DETAIL_PROJECTION,
    })
      .populate('admittedBy', 'name email role')
      .lean();
  } catch (err) {
    if (err?.code === 11000) {
      throw new ApiError(409, 'Duplicate student record conflict.');
    }
    throw err;
  }

  if (!updatedStudent) {
    throw new ApiError(404, 'Student not found.');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { student: formatSafeStudentDetail(updatedStudent) },
      'Student updated successfully.'
    )
  );
});

const validateStudentStatusBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Invalid student status payload.');
  }

  const keys = Object.keys(body);
  if (keys.length === 0) {
    throw new ApiError(400, 'isActive boolean field is required.');
  }

  for (const key of keys) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new ApiError(400, `Invalid operator or field key '${key}' in status payload.`);
    }
    if (key !== 'isActive') {
      throw new ApiError(400, `Unexpected field '${key}' in student status request.`);
    }
  }

  if (typeof body.isActive !== 'boolean') {
    throw new ApiError(400, 'isActive must be a boolean (true or false).');
  }

  return body.isActive;
};

/**
 * @desc    Activate or deactivate a permanent Student record
 * @route   PATCH /api/admin/students/:id/status
 * @access  Private (superadmin, admin, staff)
 */
export const updateStudentStatus = asyncHandler(async (req, res) => {
  const isActive = validateStudentStatusBody(req.body);

  const updatedStudent = await Student.findByIdAndUpdate(
    req.params.id,
    { $set: { isActive } },
    {
      new: true,
      runValidators: true,
      projection: DETAIL_PROJECTION,
    }
  )
    .populate('admittedBy', 'name email role')
    .lean();

  if (!updatedStudent) {
    throw new ApiError(404, 'Student not found.');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { student: formatSafeStudentDetail(updatedStudent) },
      'Student status updated successfully.'
    )
  );
});
