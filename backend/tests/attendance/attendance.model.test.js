import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import Attendance from '../../src/models/Attendance.js';
import {
  ATTENDANCE_CLASS_OPTIONS,
  ATTENDANCE_STATUSES,
  ATTENDANCE_TIMEZONE,
} from '../../src/constants/attendanceConstants.js';
import {
  getTodayIndiaDateKey,
  isValidAttendanceDateKey,
  isFutureAttendanceDate,
  validateAttendanceDateKey,
} from '../../src/utils/attendanceDate.js';

const getValidationError = async (doc) => {
  try {
    await doc.validate();
    return null;
  } catch (err) {
    return err;
  }
};

const buildValidAttendancePayload = (overrides = {}) => ({
  studentId: new mongoose.Types.ObjectId(),
  className: 'Class 8',
  attendanceDate: '2026-11-28',
  status: 'Present',
  markedBy: new mongoose.Types.ObjectId(),
  ...overrides,
});

describe('Attendance Constants, Model & Schema Tests', () => {
  test('Constants match MVP Class 8/9, Present/Absent, and Asia/Kolkata', () => {
    assert.deepEqual(ATTENDANCE_CLASS_OPTIONS, ['Class 8', 'Class 9']);
    assert.deepEqual(ATTENDANCE_STATUSES, ['Present', 'Absent']);
    assert.equal(ATTENDANCE_TIMEZONE, 'Asia/Kolkata');
  });

  test('1-6. Accepts Class 8/9 and Present/Absent, rejects unsupported classes and statuses', async () => {
    for (const className of ATTENDANCE_CLASS_OPTIONS) {
      for (const status of ATTENDANCE_STATUSES) {
        const doc = new Attendance(buildValidAttendancePayload({ className, status }));
        await doc.validate();
        assert.equal(doc.className, className);
        assert.equal(doc.status, status);
      }
    }

    for (const badClass of ['Class 1', 'Class 7', 'Class 10', 'Class 12', 'Nursery']) {
      const err = await getValidationError(
        new Attendance(buildValidAttendancePayload({ className: badClass }))
      );
      assert.ok(err?.errors?.className, `Expected error for class "${badClass}"`);
    }

    for (const badStatus of ['Half Day', 'Late', 'Leave', 'Holiday', 'Excused', 'present']) {
      const err = await getValidationError(
        new Attendance(buildValidAttendancePayload({ status: badStatus }))
      );
      assert.ok(err?.errors?.status, `Expected error for status "${badStatus}"`);
    }
  });

  test('7-9 & 18. Requires studentId, className, attendanceDate, status, and markedBy', async () => {
    const emptyErr = await getValidationError(new Attendance({}));
    assert.ok(emptyErr);

    for (const field of ['studentId', 'className', 'attendanceDate', 'status', 'markedBy']) {
      assert.ok(emptyErr.errors[field], `Expected required error for ${field}`);
    }

    const badDateErr = await getValidationError(
      new Attendance(buildValidAttendancePayload({ attendanceDate: '2026-02-30' }))
    );
    assert.ok(badDateErr?.errors?.attendanceDate);
  });

  test('10-12. References Student and Admin models and defaults updatedBy to null', () => {
    const schema = Attendance.schema;
    assert.equal(schema.path('studentId').options.ref, 'Student');
    assert.equal(schema.path('markedBy').options.ref, 'Admin');
    assert.equal(schema.path('updatedBy').options.ref, 'Admin');

    const doc = new Attendance(buildValidAttendancePayload());
    assert.equal(doc.updatedBy, null);
  });

  test('13-15. Configures unique studentId+attendanceDate, className+attendanceDate, and attendanceDate+status indexes', () => {
    const indexes = Attendance.schema.indexes();

    const uniqueStudentDate = indexes.find(
      ([fields, opts]) =>
        fields.studentId === 1 && fields.attendanceDate === 1 && opts?.unique === true
    );
    assert.ok(uniqueStudentDate, 'Expected unique index on { studentId: 1, attendanceDate: 1 }');

    const classDate = indexes.find(
      ([fields]) => fields.className === 1 && fields.attendanceDate === 1
    );
    assert.ok(classDate, 'Expected index on { className: 1, attendanceDate: 1 }');

    const dateStatus = indexes.find(
      ([fields]) => fields.attendanceDate === 1 && fields.status === 1
    );
    assert.ok(dateStatus, 'Expected index on { attendanceDate: 1, status: 1 }');
  });

  test('16-17. Enables strict mode and Mongoose timestamps', () => {
    assert.equal(Attendance.schema.options.strict, true);
    assert.equal(Attendance.schema.options.timestamps, true);

    const doc = new Attendance(
      buildValidAttendancePayload({ extraUnauthorizedField: 'should_be_stripped' })
    );
    assert.equal(doc.get('extraUnauthorizedField'), undefined);
  });
});

describe('Attendance IST Date Utilities Tests', () => {
  test('Formats India date key in Asia/Kolkata across UTC midnight boundary without local-timezone shift', () => {
    // 2026-11-28T18:30:00.000Z is 2026-11-29 00:00:00 IST
    assert.equal(getTodayIndiaDateKey(new Date('2026-11-28T18:30:00.000Z')), '2026-11-29');
    // 2026-11-28T18:29:59.000Z is 2026-11-28 23:59:59 IST
    assert.equal(getTodayIndiaDateKey(new Date('2026-11-28T18:29:59.000Z')), '2026-11-28');
  });

  test('Validates real calendar dates including leap years and rejects invalid formats/impossible dates', () => {
    assert.equal(isValidAttendanceDateKey('2024-02-29'), true);
    assert.equal(isValidAttendanceDateKey('2026-11-28'), true);

    assert.equal(isValidAttendanceDateKey('2026-02-29'), false); // non-leap year
    assert.equal(isValidAttendanceDateKey('2026-02-30'), false);
    assert.equal(isValidAttendanceDateKey('2026-13-01'), false);
    assert.equal(isValidAttendanceDateKey('2026-00-10'), false);
    assert.equal(isValidAttendanceDateKey('2026-11-00'), false);
    assert.equal(isValidAttendanceDateKey('2026-11-31'), false);
    assert.equal(isValidAttendanceDateKey('2026-11-28T00:00:00.000Z'), false);
    assert.equal(isValidAttendanceDateKey(' 2026-11-28 '), false);
    assert.equal(isValidAttendanceDateKey('28-11-2026'), false);
    assert.equal(isValidAttendanceDateKey(null), false);
    assert.equal(isValidAttendanceDateKey(new Date('2026-11-28')), false);
  });

  test('Checks future, today, and past dates deterministically against Asia/Kolkata reference', () => {
    // Reference: 2026-11-28T12:00:00.000Z -> 2026-11-28 17:30 IST
    const ref = new Date('2026-11-28T12:00:00.000Z');

    assert.equal(isFutureAttendanceDate('2026-11-29', ref), true);
    assert.equal(isFutureAttendanceDate('2026-11-28', ref), false);
    assert.equal(isFutureAttendanceDate('2026-11-27', ref), false);

    assert.deepEqual(validateAttendanceDateKey('2026-11-28', ref), {
      valid: true,
      reason: null,
      message: '',
    });
    assert.deepEqual(validateAttendanceDateKey('2026-11-01', ref), {
      valid: true,
      reason: null,
      message: '',
    });
    assert.equal(validateAttendanceDateKey('2026-11-29', ref).reason, 'FUTURE_DATE');
    assert.equal(validateAttendanceDateKey('2026-02-30', ref).reason, 'INVALID_CALENDAR_DATE');
    assert.equal(validateAttendanceDateKey('2026/11/28', ref).reason, 'INVALID_FORMAT');
  });
});
