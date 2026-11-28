import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  getStudentStatusActionConfig,
  getStudentStatusErrorDetails,
} from '../src/utils/adminStudentStatusUtils.js';
import { normalizeStudentDetail } from '../src/utils/adminStudentDetailUtils.js';

describe('Admin Student Status Utilities Tests', () => {
  test('1-5. Maps active/inactive booleans to exact nextIsActive boolean and labels', () => {
    const deactivateConfig = getStudentStatusActionConfig(true);
    assert.equal(deactivateConfig.actionType, 'deactivate');
    assert.strictEqual(deactivateConfig.nextIsActive, false);
    assert.equal(deactivateConfig.buttonLabel, 'Deactivate Student');
    assert.equal(deactivateConfig.confirmLabel, 'Confirm Deactivation');
    assert.match(deactivateConfig.message, /will not be deleted/i);

    const activateConfig = getStudentStatusActionConfig(false);
    assert.equal(activateConfig.actionType, 'activate');
    assert.strictEqual(activateConfig.nextIsActive, true);
    assert.equal(activateConfig.buttonLabel, 'Activate Student');
    assert.equal(activateConfig.confirmLabel, 'Confirm Activation');
    assert.match(activateConfig.message, /active-student attendance/i);
  });

  test('6. Handles invalid or missing current status safely without defaulting', () => {
    assert.equal(getStudentStatusActionConfig(undefined), null);
    assert.equal(getStudentStatusActionConfig(null), null);
    assert.equal(getStudentStatusActionConfig('true'), null);
    assert.equal(getStudentStatusActionConfig('false'), null);
    assert.equal(getStudentStatusActionConfig(1), null);
    assert.equal(getStudentStatusActionConfig(0), null);
  });

  test('8 & 10. Normalizes status update response while preserving Student identity fields', () => {
    const res = {
      data: {
        student: {
          _id: 'stu_1',
          fullName: 'Aarav Sharma',
          className: 'Class 9',
          admissionNumber: 'ADM-2026-0001',
          applicationNumber: 'SSG-2026-1234',
          admittedAt: '2026-11-10T10:30:00.000Z',
          isActive: false,
        },
      },
    };

    const normalized = normalizeStudentDetail(res);
    assert.equal(normalized._id, 'stu_1');
    assert.equal(normalized.admissionNumber, 'ADM-2026-0001');
    assert.equal(normalized.applicationNumber, 'SSG-2026-1234');
    assert.equal(normalized.admittedAt, '2026-11-10T10:30:00.000Z');
    assert.strictEqual(normalized.isActive, false);
  });

  test('9. Classifies 400, 401/403, 404, 409, and 500/network errors accurately', () => {
    assert.deepEqual(
      getStudentStatusErrorDetails({
        response: { status: 400, data: { message: 'isActive must be boolean' } },
      }),
      {
        status: 400,
        shouldRefresh: false,
        message: 'isActive must be boolean',
      }
    );

    assert.deepEqual(
      getStudentStatusErrorDetails({ response: { status: 403 } }),
      {
        status: 403,
        shouldRefresh: false,
        message: 'You are not authorized to change this student’s status.',
      }
    );

    assert.deepEqual(
      getStudentStatusErrorDetails({ response: { status: 404 } }),
      {
        status: 404,
        shouldRefresh: true,
        message: 'This student record no longer exists.',
      }
    );

    assert.deepEqual(
      getStudentStatusErrorDetails({
        response: { status: 409, data: { message: 'Conflict' } },
      }),
      {
        status: 409,
        shouldRefresh: true,
        message: 'Conflict',
      }
    );

    assert.deepEqual(getStudentStatusErrorDetails(new Error('Network')), {
      status: 500,
      shouldRefresh: false,
      message: 'Failed to update student status. Please try again.',
    });
  });
});
