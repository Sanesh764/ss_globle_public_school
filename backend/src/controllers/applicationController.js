import mongoose from 'mongoose';
import StudentApplication, {
  APPLICATION_STATUSES,
  CLASS_OPTIONS,
  EMAIL_MAX_LENGTH,
  GENDER_OPTIONS,
  NAME_MAX_LENGTH,
  NAME_MIN_LENGTH,
  isValidNonFutureIndiaDate,
  normalizeIndianContactNumber,
} from '../models/StudentApplication.js';
import Student from '../models/Student.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 15;
export const MAX_LIMIT = 50;

const EDITABLE_APPLICATION_FIELDS = [
  'fullName',
  'dateOfBirth',
  'gender',
  'fatherName',
  'motherName',
  'contactNumber',
  'classApplyingFor',
  'email',
];
const ALLOWED_PATCH_KEYS = [...EDITABLE_APPLICATION_FIELDS, 'note'];
const EDITABLE_STATUSES = ['Pending', 'Correction Requested'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NOTE_MAX_LENGTH = 500;
const CORRECTION_MESSAGE_MIN_LENGTH = 5;

const LIST_PROJECTION = {
  _id: 1,
  applicationNumber: 1,
  fullName: 1,
  classApplyingFor: 1,
  status: 1,
  createdAt: 1,
};

const DETAIL_PROJECTION = {
  _id: 1,
  applicationNumber: 1,
  fullName: 1,
  dateOfBirth: 1,
  gender: 1,
  classApplyingFor: 1,
  photo: 1,
  fatherName: 1,
  motherName: 1,
  contactNumber: 1,
  email: 1,
  status: 1,
  reviewedBy: 1,
  reviewedAt: 1,
  reviewNotes: 1,
  correctionMessage: 1,
  approvedStudentId: 1,
  reviewHistory: 1,
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

/**
 * @desc    List student registration applications with search, filters, and pagination
 * @route   GET /api/admin/applications
 * @access  Private (superadmin, admin, staff)
 */
export const getStudentApplications = asyncHandler(async (req, res) => {
  const page = parsePositiveIntParam(req.query.page, 'page', DEFAULT_PAGE);
  const limit = parsePositiveIntParam(req.query.limit, 'limit', DEFAULT_LIMIT, MAX_LIMIT);

  const filter = {};

  if (req.query.status !== undefined && String(req.query.status).trim() !== '') {
    const status = String(req.query.status).trim();
    if (!APPLICATION_STATUSES.includes(status)) {
      throw new ApiError(
        400,
        `Invalid status filter. Allowed values: ${APPLICATION_STATUSES.join(', ')}.`
      );
    }
    filter.status = status;
  }

  if (
    req.query.classApplyingFor !== undefined &&
    String(req.query.classApplyingFor).trim() !== ''
  ) {
    const classApplyingFor = String(req.query.classApplyingFor).trim();
    if (!CLASS_OPTIONS.includes(classApplyingFor)) {
      throw new ApiError(
        400,
        'Invalid classApplyingFor filter. Must be between Class 1 and Class 12.'
      );
    }
    filter.classApplyingFor = classApplyingFor;
  }

  if (req.query.search !== undefined && String(req.query.search).trim() !== '') {
    const rawSearch = String(req.query.search).trim().slice(0, 100);
    const safeRegex = new RegExp(escapeRegex(rawSearch), 'i');
    filter.$or = [
      { applicationNumber: safeRegex },
      { fullName: safeRegex },
      { contactNumber: safeRegex },
    ];
  }

  const skip = (page - 1) * limit;

  const [totalRecords, applications] = await Promise.all([
    StudentApplication.countDocuments(filter),
    StudentApplication.find(filter, LIST_PROJECTION)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
  ]);

  const totalPages = Math.ceil(totalRecords / limit) || 1;

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        applications,
        pagination: {
          totalRecords,
          currentPage: page,
          pageSize: limit,
          totalPages,
        },
      },
      'Student applications retrieved successfully'
    )
  );
});

const formatSafeApplicationDetail = (application) => ({
  _id: application._id,
  applicationNumber: application.applicationNumber,
  fullName: application.fullName,
  dateOfBirth: application.dateOfBirth,
  gender: application.gender,
  classApplyingFor: application.classApplyingFor,
  photo: application.photo || { url: '', public_id: '' },
  fatherName: application.fatherName,
  motherName: application.motherName,
  contactNumber: application.contactNumber,
  email: application.email ?? null,
  status: application.status,
  reviewedBy: application.reviewedBy || null,
  reviewedAt: application.reviewedAt || null,
  reviewNotes: application.reviewNotes || '',
  correctionMessage: application.correctionMessage || '',
  approvedStudentId: application.approvedStudentId || null,
  reviewHistory: Array.isArray(application.reviewHistory) ? application.reviewHistory : [],
  createdAt: application.createdAt,
  updatedAt: application.updatedAt,
});

/**
 * @desc    Get single student registration application details
 * @route   GET /api/admin/applications/:id
 * @access  Private (superadmin, admin, staff)
 */
export const getStudentApplicationById = asyncHandler(async (req, res) => {
  const application = await StudentApplication.findById(req.params.id, DETAIL_PROJECTION)
    .populate('reviewedBy', 'name email role')
    .populate('reviewHistory.performedBy', 'name email role')
    .lean();

  if (!application) {
    throw new ApiError(404, 'Student application not found.');
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { application: formatSafeApplicationDetail(application) },
      'Student application details retrieved successfully'
    )
  );
});

const validateAndNormalizePatchFields = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Invalid update payload.');
  }

  const keys = Object.keys(body);
  for (const key of keys) {
    if (key.startsWith('$') || key.includes('.')) {
      throw new ApiError(400, `Invalid operator or field key '${key}' in update payload.`);
    }
    if (!ALLOWED_PATCH_KEYS.includes(key)) {
      throw new ApiError(400, `Field '${key}' cannot be modified.`);
    }
  }

  const providedEditableFields = keys.filter((k) => EDITABLE_APPLICATION_FIELDS.includes(k));
  if (providedEditableFields.length === 0) {
    throw new ApiError(400, 'At least one editable application field must be provided.');
  }

  let cleanNote = '';
  if (Object.prototype.hasOwnProperty.call(body, 'note')) {
    if (body.note !== null && body.note !== undefined) {
      if (typeof body.note !== 'string') {
        throw new ApiError(400, 'Review note must be a text string.');
      }
      cleanNote = body.note.trim();
      if (cleanNote.length > NOTE_MAX_LENGTH) {
        throw new ApiError(400, `Review note must not exceed ${NOTE_MAX_LENGTH} characters.`);
      }
    }
  }

  const updates = {};

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
      updates[nameField] = trimmed;
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
    updates.dateOfBirth = new Date(val);
  }

  if (Object.prototype.hasOwnProperty.call(body, 'gender')) {
    const val = body.gender;
    if (typeof val !== 'string' || !GENDER_OPTIONS.includes(val.trim())) {
      throw new ApiError(400, 'Gender must be Male, Female, or Other.');
    }
    updates.gender = val.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'classApplyingFor')) {
    const val = body.classApplyingFor;
    if (typeof val !== 'string' || !CLASS_OPTIONS.includes(val.trim())) {
      throw new ApiError(400, 'Class applying for must be between Class 1 and Class 12.');
    }
    updates.classApplyingFor = val.trim();
  }

  if (Object.prototype.hasOwnProperty.call(body, 'contactNumber')) {
    const normalizedPhone = normalizeIndianContactNumber(body.contactNumber);
    if (!normalizedPhone) {
      throw new ApiError(
        400,
        'Please provide a valid 10-digit Indian mobile number (with optional +91).'
      );
    }
    updates.contactNumber = normalizedPhone;
  }

  if (Object.prototype.hasOwnProperty.call(body, 'email')) {
    const val = body.email;
    if (val === null || val === undefined || (typeof val === 'string' && val.trim() === '')) {
      updates.email = undefined;
    } else if (typeof val !== 'string') {
      throw new ApiError(400, 'Email must be a text string.');
    } else {
      const normalizedEmail = val.trim().toLowerCase();
      if (normalizedEmail.length > EMAIL_MAX_LENGTH || !EMAIL_REGEX.test(normalizedEmail)) {
        throw new ApiError(400, 'Please provide a valid email address.');
      }
      updates.email = normalizedEmail;
    }
  }

  return { updates, cleanNote };
};

/**
 * @desc    Edit student registration application details (Pending or Correction Requested only)
 * @route   PATCH /api/admin/applications/:id
 * @access  Private (superadmin, admin, staff)
 */
export const updateStudentApplication = asyncHandler(async (req, res) => {
  const { updates, cleanNote } = validateAndNormalizePatchFields(req.body);

  const application = await StudentApplication.findById(req.params.id);
  if (!application) {
    throw new ApiError(404, 'Student application not found.');
  }

  if (!EDITABLE_STATUSES.includes(application.status)) {
    throw new ApiError(
      409,
      `Application is locked and cannot be edited because its status is '${application.status}'.`
    );
  }

  const changedFields = [];

  for (const [field, newValue] of Object.entries(updates)) {
    if (field === 'dateOfBirth') {
      const currentMs = application.dateOfBirth ? new Date(application.dateOfBirth).getTime() : null;
      const nextMs = newValue.getTime();
      if (currentMs !== nextMs) {
        application.dateOfBirth = newValue;
        changedFields.push('dateOfBirth');
      }
    } else if (field === 'email') {
      const currentEmail = application.email || undefined;
      if (currentEmail !== newValue) {
        application.email = newValue;
        changedFields.push('email');
      }
    } else if (application[field] !== newValue) {
      application[field] = newValue;
      changedFields.push(field);
    }
  }

  if (changedFields.length > 0) {
    const normalizedRole = (req.admin?.role || '').toString().toLowerCase().replace(/_/g, '');
    const actorType = normalizedRole === 'staff' ? 'Staff' : 'Admin';

    if (!Array.isArray(application.reviewHistory)) {
      application.reviewHistory = [];
    }

    application.reviewHistory.push({
      action: 'UPDATED',
      performedBy: req.admin._id,
      actorType,
      note: cleanNote,
      changedFields,
      timestamp: new Date(),
    });

    await application.save();
  }

  const plainApp =
    typeof application.toObject === 'function' ? application.toObject() : application;

  return res.status(200).json(
    new ApiResponse(
      200,
      { application: formatSafeApplicationDetail(plainApp) },
      changedFields.length > 0
        ? 'Student application updated successfully'
        : 'No changes detected on student application'
    )
  );
});

const validateApprovalBody = (body) => {
  if (body === undefined || body === null) {
    return '';
  }
  if (typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Invalid approval payload.');
  }

  const keys = Object.keys(body);
  for (const key of keys) {
    if (key !== 'note') {
      throw new ApiError(400, `Unexpected field '${key}' in approval request.`);
    }
  }

  if (body.note === undefined || body.note === null) {
    return '';
  }
  if (typeof body.note !== 'string') {
    throw new ApiError(400, 'Approval note must be a text string.');
  }

  const trimmed = body.note.trim();
  if (trimmed.length > NOTE_MAX_LENGTH) {
    throw new ApiError(400, `Approval note must not exceed ${NOTE_MAX_LENGTH} characters.`);
  }
  return trimmed;
};

/**
 * @desc    Approve a student application and atomically create a permanent Student record
 * @route   PATCH /api/admin/applications/:id/approve
 * @access  Private (superadmin, admin, staff)
 */
export const approveStudentApplication = asyncHandler(async (req, res) => {
  const cleanNote = validateApprovalBody(req.body);
  const approvalTime = new Date();
  const normalizedRole = (req.admin?.role || '').toString().toLowerCase().replace(/_/g, '');
  const actorType = normalizedRole === 'staff' ? 'Staff' : 'Admin';

  const session = await mongoose.startSession();
  let createdStudent = null;
  let updatedApplication = null;

  try {
    session.startTransaction();

    const application = await StudentApplication.findById(req.params.id).session(session);
    if (!application) {
      throw new ApiError(404, 'Student application not found.');
    }

    if (!EDITABLE_STATUSES.includes(application.status)) {
      throw new ApiError(
        409,
        `Application cannot be approved because its status is '${application.status}'.`
      );
    }

    const studentPayload = {
      fullName: application.fullName,
      dateOfBirth: application.dateOfBirth,
      gender: application.gender,
      fatherName: application.fatherName,
      motherName: application.motherName,
      contactNumber: application.contactNumber,
      className: application.classApplyingFor,
      sourceApplicationId: application._id,
      applicationNumber: application.applicationNumber,
      admittedBy: req.admin._id,
      admittedAt: approvalTime,
      isActive: true,
    };

    if (typeof application.email === 'string' && application.email.trim() !== '') {
      studentPayload.email = application.email.trim().toLowerCase();
    }

    if (application.photo && typeof application.photo.url === 'string' && application.photo.url.trim() !== '') {
      studentPayload.photo = {
        url: application.photo.url.trim(),
        public_id: (application.photo.public_id || '').trim(),
      };
    }

    try {
      const createdStudents = await Student.create([studentPayload], { session });
      createdStudent = createdStudents[0];
    } catch (err) {
      if (err?.code === 11000) {
        throw new ApiError(409, 'A permanent student record already exists for this application.');
      }
      throw err;
    }

    updatedApplication = await StudentApplication.findOneAndUpdate(
      {
        _id: application._id,
        status: { $in: EDITABLE_STATUSES },
      },
      {
        $set: {
          status: 'Approved',
          reviewedBy: req.admin._id,
          reviewedAt: approvalTime,
          approvedStudentId: createdStudent._id,
        },
        $push: {
          reviewHistory: {
            action: 'APPROVED',
            performedBy: req.admin._id,
            actorType,
            note: cleanNote,
            changedFields: ['status', 'approvedStudentId'],
            timestamp: approvalTime,
          },
        },
      },
      {
        new: true,
        runValidators: true,
        session,
      }
    );

    if (!updatedApplication) {
      throw new ApiError(
        409,
        'Application could not be approved because its status changed concurrently.'
      );
    }

    await session.commitTransaction();
  } catch (err) {
    try {
      await session.abortTransaction();
    } catch {
      // Ignore abort errors if transaction was not active
    }
    throw err;
  } finally {
    await session.endSession();
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        approval: {
          applicationNumber: updatedApplication.applicationNumber,
          status: updatedApplication.status,
          approvedStudentId: createdStudent._id,
          studentName: createdStudent.fullName,
          className: createdStudent.className,
          admittedAt: createdStudent.admittedAt,
        },
      },
      'Student application approved and permanent student record created successfully'
    )
  );
});

const validateCorrectionBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Invalid correction request payload.');
  }

  const keys = Object.keys(body);
  for (const key of keys) {
    if (key !== 'correctionMessage') {
      throw new ApiError(400, `Unexpected field '${key}' in correction request.`);
    }
  }

  if (typeof body.correctionMessage !== 'string') {
    throw new ApiError(400, 'Correction message is required and must be a text string.');
  }

  const trimmed = body.correctionMessage.trim();
  if (!trimmed) {
    throw new ApiError(400, 'Correction message cannot be empty.');
  }
  if (trimmed.length < CORRECTION_MESSAGE_MIN_LENGTH || trimmed.length > NOTE_MAX_LENGTH) {
    throw new ApiError(
      400,
      `Correction message must be between ${CORRECTION_MESSAGE_MIN_LENGTH} and ${NOTE_MAX_LENGTH} characters.`
    );
  }

  return trimmed;
};

/**
 * @desc    Request corrections on a Pending or Correction Requested application
 * @route   PATCH /api/admin/applications/:id/request-correction
 * @access  Private (superadmin, admin, staff)
 */
export const requestApplicationCorrection = asyncHandler(async (req, res) => {
  const cleanMessage = validateCorrectionBody(req.body);

  const existingApplication = await StudentApplication.findById(req.params.id);
  if (!existingApplication) {
    throw new ApiError(404, 'Student application not found.');
  }

  if (!EDITABLE_STATUSES.includes(existingApplication.status)) {
    throw new ApiError(
      409,
      `Correction cannot be requested because application status is '${existingApplication.status}'.`
    );
  }

  const reviewTime = new Date();
  const normalizedRole = (req.admin?.role || '').toString().toLowerCase().replace(/_/g, '');
  const actorType = normalizedRole === 'staff' ? 'Staff' : 'Admin';

  const updatedApplication = await StudentApplication.findOneAndUpdate(
    {
      _id: existingApplication._id,
      status: { $in: EDITABLE_STATUSES },
    },
    {
      $set: {
        status: 'Correction Requested',
        correctionMessage: cleanMessage,
        reviewedBy: req.admin._id,
        reviewedAt: reviewTime,
      },
      $push: {
        reviewHistory: {
          action: 'CORRECTION_REQUESTED',
          performedBy: req.admin._id,
          actorType,
          note: cleanMessage,
          changedFields: ['status', 'correctionMessage'],
          timestamp: reviewTime,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedApplication) {
    throw new ApiError(
      409,
      'Application could not be updated because its status changed concurrently.'
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        application: {
          applicationNumber: updatedApplication.applicationNumber,
          status: updatedApplication.status,
          correctionMessage: updatedApplication.correctionMessage,
          reviewedAt: updatedApplication.reviewedAt,
        },
      },
      'Correction requested successfully'
    )
  );
});

const validateRejectionBody = (body) => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new ApiError(400, 'Invalid rejection payload.');
  }

  const keys = Object.keys(body);
  for (const key of keys) {
    if (key !== 'rejectionReason') {
      throw new ApiError(400, `Unexpected field '${key}' in rejection request.`);
    }
  }

  if (typeof body.rejectionReason !== 'string') {
    throw new ApiError(400, 'Rejection reason is required and must be a text string.');
  }

  const trimmed = body.rejectionReason.trim();
  if (!trimmed) {
    throw new ApiError(400, 'Rejection reason cannot be empty.');
  }
  if (trimmed.length < CORRECTION_MESSAGE_MIN_LENGTH || trimmed.length > NOTE_MAX_LENGTH) {
    throw new ApiError(
      400,
      `Rejection reason must be between ${CORRECTION_MESSAGE_MIN_LENGTH} and ${NOTE_MAX_LENGTH} characters.`
    );
  }

  return trimmed;
};

/**
 * @desc    Reject a Pending or Correction Requested application
 * @route   PATCH /api/admin/applications/:id/reject
 * @access  Private (superadmin, admin, staff)
 */
export const rejectStudentApplication = asyncHandler(async (req, res) => {
  const cleanReason = validateRejectionBody(req.body);

  const existingApplication = await StudentApplication.findById(req.params.id);
  if (!existingApplication) {
    throw new ApiError(404, 'Student application not found.');
  }

  if (!EDITABLE_STATUSES.includes(existingApplication.status)) {
    throw new ApiError(
      409,
      `Application cannot be rejected because its status is '${existingApplication.status}'.`
    );
  }

  const reviewTime = new Date();
  const normalizedRole = (req.admin?.role || '').toString().toLowerCase().replace(/_/g, '');
  const actorType = normalizedRole === 'staff' ? 'Staff' : 'Admin';

  const updatedApplication = await StudentApplication.findOneAndUpdate(
    {
      _id: existingApplication._id,
      status: { $in: EDITABLE_STATUSES },
    },
    {
      $set: {
        status: 'Rejected',
        reviewNotes: cleanReason,
        reviewedBy: req.admin._id,
        reviewedAt: reviewTime,
      },
      $push: {
        reviewHistory: {
          action: 'REJECTED',
          performedBy: req.admin._id,
          actorType,
          note: cleanReason,
          changedFields: ['status', 'reviewNotes'],
          timestamp: reviewTime,
        },
      },
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!updatedApplication) {
    throw new ApiError(
      409,
      'Application could not be rejected because its status changed concurrently.'
    );
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        application: {
          applicationNumber: updatedApplication.applicationNumber,
          status: updatedApplication.status,
          reviewNotes: updatedApplication.reviewNotes,
          reviewedBy: updatedApplication.reviewedBy,
          reviewedAt: updatedApplication.reviewedAt,
        },
      },
      'Student application rejected successfully'
    )
  );
});
