import { isApplicationEditable } from './adminApplicationEditUtils.js';

export const REVIEW_MESSAGE_MIN_LENGTH = 5;
export const REVIEW_MESSAGE_MAX_LENGTH = 500;

export const REVIEW_ACTION_LABELS = {
  SUBMITTED: 'Submitted',
  UPDATED: 'Updated',
  APPROVED: 'Approved',
  CORRECTION_REQUESTED: 'Correction Requested',
  REJECTED: 'Rejected',
};

/**
 * Applications in Pending or Correction Requested status can receive review actions.
 * Approved and Rejected applications are locked.
 */
export const canReviewApplication = (status) => isApplicationEditable(status);

export const getReviewHistoryActionLabel = (action) => {
  if (typeof action !== 'string' || !action.trim()) return 'Activity';
  const normalized = action.trim().toUpperCase();
  return REVIEW_ACTION_LABELS[normalized] || action;
};

export const validateReviewMessage = (value, fieldLabel = 'Message') => {
  if (typeof value !== 'string') {
    return `${fieldLabel} is required.`;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return `${fieldLabel} is required.`;
  }

  if (trimmed.length < REVIEW_MESSAGE_MIN_LENGTH) {
    return `${fieldLabel} must be at least ${REVIEW_MESSAGE_MIN_LENGTH} characters.`;
  }

  if (trimmed.length > REVIEW_MESSAGE_MAX_LENGTH) {
    return `${fieldLabel} must not exceed ${REVIEW_MESSAGE_MAX_LENGTH} characters.`;
  }

  return '';
};

export const validateCorrectionMessage = (value) =>
  validateReviewMessage(value, 'Correction message');

export const validateRejectionReason = (value) =>
  validateReviewMessage(value, 'Rejection reason');

export const getReviewErrorDetails = (err, fallbackMessage) => {
  const status = err?.response?.status;
  const apiMessage = err?.response?.data?.message;

  if (status === 400) {
    return {
      status,
      isConflict: false,
      message: apiMessage || 'Please check the submitted information and try again.',
    };
  }

  if (status === 401 || status === 403) {
    return {
      status,
      isConflict: false,
      message: apiMessage || 'You are not authorized to perform this review action.',
    };
  }

  if (status === 404) {
    return {
      status,
      isConflict: false,
      message: apiMessage || 'This student application no longer exists.',
    };
  }

  if (status === 409) {
    return {
      status,
      isConflict: true,
      message:
        apiMessage ||
        'This application status has changed and the action is no longer allowed.',
    };
  }

  return {
    status: status || 500,
    isConflict: false,
    message: apiMessage || fallbackMessage || 'An unexpected error occurred. Please try again.',
  };
};
