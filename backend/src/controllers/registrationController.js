import StudentApplication from '../models/StudentApplication.js';
import generateApplicationNumber from '../utils/generateApplicationNumber.js';
import {
  uploadStudentPhotoToCloudinary,
  deleteStudentPhotoFromCloudinary,
} from '../utils/studentPhotoStorage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import logger from '../utils/logger.js';

const MAX_APPLICATION_NUMBER_RETRIES = 3;

const isApplicationNumberDuplicateError = (err) => {
  if (!err || err.code !== 11000) return false;
  if (err.keyPattern && err.keyPattern.applicationNumber) return true;
  if (err.keyValue && Object.prototype.hasOwnProperty.call(err.keyValue, 'applicationNumber')) {
    return true;
  }
  return typeof err.message === 'string' && err.message.includes('applicationNumber');
};

/**
 * @desc    Submit a public student self-registration application
 * @route   POST /api/registrations
 * @access  Public
 */
export const submitStudentRegistration = asyncHandler(async (req, res) => {
  const {
    fullName,
    dateOfBirth,
    gender,
    fatherName,
    motherName,
    contactNumber,
    classApplyingFor,
    email,
  } = req.body;

  const basePayload = {
    fullName: fullName.trim(),
    dateOfBirth: new Date(dateOfBirth),
    gender: gender.trim(),
    fatherName: fatherName.trim(),
    motherName: motherName.trim(),
    contactNumber: contactNumber.trim(),
    classApplyingFor: classApplyingFor.trim(),
    status: 'Pending',
    reviewHistory: [
      {
        action: 'SUBMITTED',
        actorType: 'Applicant',
        note: 'Public registration application submitted',
        changedFields: [],
      },
    ],
  };

  if (typeof email === 'string' && email.trim() !== '') {
    basePayload.email = email.trim().toLowerCase();
  }

  let uploadedPhoto = null;
  if (req.file) {
    uploadedPhoto = await uploadStudentPhotoToCloudinary(req.file);
    basePayload.photo = uploadedPhoto;
  }

  let createdApplication = null;

  try {
    for (let attempt = 0; attempt <= MAX_APPLICATION_NUMBER_RETRIES; attempt++) {
      const applicationNumber = generateApplicationNumber();

      try {
        createdApplication = await StudentApplication.create({
          ...basePayload,
          applicationNumber,
        });
        break;
      } catch (err) {
        if (isApplicationNumberDuplicateError(err)) {
          if (attempt < MAX_APPLICATION_NUMBER_RETRIES) {
            continue;
          }
          throw new ApiError(
            500,
            'Unable to generate a unique application reference number. Please try again.'
          );
        }
        throw err;
      }
    }
  } catch (saveErr) {
    if (uploadedPhoto?.public_id) {
      await deleteStudentPhotoFromCloudinary(uploadedPhoto.public_id).catch((cleanupErr) => {
        logger.warn(
          '[Registration] Failed to delete orphaned Cloudinary photo after database error',
          cleanupErr?.message || 'Cleanup error'
        );
      });
    }
    throw saveErr;
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        application: {
          _id: createdApplication._id,
          applicationNumber: createdApplication.applicationNumber,
          fullName: createdApplication.fullName,
          classApplyingFor: createdApplication.classApplyingFor,
          status: createdApplication.status,
          createdAt: createdApplication.createdAt,
        },
      },
      'Student registration application submitted successfully.'
    )
  );
});
