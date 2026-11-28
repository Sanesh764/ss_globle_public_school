import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  REVIEW_MESSAGE_MIN_LENGTH,
  REVIEW_MESSAGE_MAX_LENGTH,
  canReviewApplication,
  getReviewHistoryActionLabel,
  validateCorrectionMessage,
  validateRejectionReason,
  getReviewErrorDetails,
} from '../src/utils/adminApplicationReviewUtils.js';

describe('Admin Application Review Utilities Tests', () => {
  test('canReviewApplication allows Pending and Correction Requested and locks Approved and Rejected', () => {
    assert.equal(canReviewApplication('Pending'), true);
    assert.equal(canReviewApplication('Correction Requested'), true);
    assert.equal(canReviewApplication('Approved'), false);
    assert.equal(canReviewApplication('Rejected'), false);
    assert.equal(canReviewApplication(''), false);
    assert.equal(canReviewApplication(undefined), false);
  });

  test('validateCorrectionMessage enforces 5-500 trimmed character bounds', () => {
    assert.equal(validateCorrectionMessage(''), 'Correction message is required.');
    assert.equal(validateCorrectionMessage('    '), 'Correction message is required.');
    assert.equal(validateCorrectionMessage(null), 'Correction message is required.');
    assert.equal(
      validateCorrectionMessage(' abcd '),
      `Correction message must be at least ${REVIEW_MESSAGE_MIN_LENGTH} characters.`
    );
    assert.equal(validateCorrectionMessage('12345'), '');
    assert.equal(validateCorrectionMessage('a'.repeat(REVIEW_MESSAGE_MAX_LENGTH)), '');
    assert.equal(
      validateCorrectionMessage('a'.repeat(REVIEW_MESSAGE_MAX_LENGTH + 1)),
      `Correction message must not exceed ${REVIEW_MESSAGE_MAX_LENGTH} characters.`
    );
  });

  test('validateRejectionReason enforces 5-500 trimmed character bounds', () => {
    assert.equal(validateRejectionReason(''), 'Rejection reason is required.');
    assert.equal(validateRejectionReason('   '), 'Rejection reason is required.');
    assert.equal(
      validateRejectionReason('no'),
      `Rejection reason must be at least ${REVIEW_MESSAGE_MIN_LENGTH} characters.`
    );
    assert.equal(validateRejectionReason('Valid reason'), '');
    assert.equal(validateRejectionReason('b'.repeat(REVIEW_MESSAGE_MAX_LENGTH)), '');
    assert.equal(
      validateRejectionReason('b'.repeat(REVIEW_MESSAGE_MAX_LENGTH + 1)),
      `Rejection reason must not exceed ${REVIEW_MESSAGE_MAX_LENGTH} characters.`
    );
  });

  test('getReviewHistoryActionLabel maps backend action codes cleanly', () => {
    assert.equal(getReviewHistoryActionLabel('SUBMITTED'), 'Submitted');
    assert.equal(getReviewHistoryActionLabel('UPDATED'), 'Updated');
    assert.equal(getReviewHistoryActionLabel('APPROVED'), 'Approved');
    assert.equal(getReviewHistoryActionLabel('CORRECTION_REQUESTED'), 'Correction Requested');
    assert.equal(getReviewHistoryActionLabel('REJECTED'), 'Rejected');
    assert.equal(getReviewHistoryActionLabel('CUSTOM_ACTION'), 'CUSTOM_ACTION');
    assert.equal(getReviewHistoryActionLabel(''), 'Activity');
  });

  test('getReviewErrorDetails classifies 400, 401/403, 404, 409 conflict, and 500/network errors', () => {
    const err400 = { response: { status: 400, data: { message: 'Invalid correction payload' } } };
    assert.deepEqual(getReviewErrorDetails(err400, 'Fallback'), {
      status: 400,
      isConflict: false,
      message: 'Invalid correction payload',
    });

    const err403 = { response: { status: 403, data: {} } };
    assert.deepEqual(getReviewErrorDetails(err403, 'Fallback'), {
      status: 403,
      isConflict: false,
      message: 'You are not authorized to perform this review action.',
    });

    const err404 = { response: { status: 404, data: {} } };
    assert.deepEqual(getReviewErrorDetails(err404, 'Fallback'), {
      status: 404,
      isConflict: false,
      message: 'This student application no longer exists.',
    });

    const err409 = {
      response: {
        status: 409,
        data: { message: "Application cannot be approved because its status is 'Approved'." },
      },
    };
    assert.deepEqual(getReviewErrorDetails(err409, 'Fallback'), {
      status: 409,
      isConflict: true,
      message: "Application cannot be approved because its status is 'Approved'.",
    });

    const errNetwork = new Error('Network Error');
    assert.deepEqual(getReviewErrorDetails(errNetwork, 'Network fallback'), {
      status: 500,
      isConflict: false,
      message: 'Network fallback',
    });
  });
});
