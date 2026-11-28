import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ATTENDANCE_CLASS_OPTIONS,
  getTodayIndiaDateKey,
  isAttendanceClass,
  isValidAttendanceDate,
} from '../src/utils/adminAttendanceUtils.js';
import {
  DEFAULT_ATTENDANCE_CLASS,
  normalizeAttendanceSheetResponse,
  getAttendanceSheetErrorMessage,
  getAttendanceStatusBadgeMeta,
} from '../src/utils/adminAttendanceSheetUtils.js';

describe('Admin Attendance Dashboard Utilities Tests', () => {
  test('1-2. Defaults to Class 8 and validates only Class 8 and Class 9', () => {
    assert.equal(DEFAULT_ATTENDANCE_CLASS, 'Class 8');
    assert.deepEqual(ATTENDANCE_CLASS_OPTIONS, ['Class 8', 'Class 9']);
    assert.equal(isAttendanceClass('Class 8'), true);
    assert.equal(isAttendanceClass('Class 9'), true);
    assert.equal(isAttendanceClass('Class 10'), false);
    assert.equal(isAttendanceClass('Class 1'), false);
  });

  test('3-5. Uses Asia/Kolkata YYYY-MM-DD date keys and rejects future or malformed dates', () => {
    const ref = new Date('2026-11-28T18:30:00.000Z'); // 2026-11-29 00:00 IST
    assert.equal(getTodayIndiaDateKey(ref), '2026-11-29');
    assert.equal(isValidAttendanceDate('2026-11-29', ref), true);
    assert.equal(isValidAttendanceDate('2026-11-28', ref), true);
    assert.equal(isValidAttendanceDate('2026-11-30', ref), false);
    assert.equal(isValidAttendanceDate('2026-02-30', ref), false);
    assert.equal(isValidAttendanceDate('2026/11/28', ref), false);
  });

  test('6-10. Normalizes sheet response, keeps Unmarked distinct from Absent, identifies cross-class conflict and unavailable students', () => {
    const res = {
      data: {
        sheet: {
          className: 'Class 8',
          attendanceDate: '2026-11-28',
          students: [
            {
              studentId: 'stu_1',
              fullName: 'Aarav Sharma',
              admissionNumber: 'ADM-1',
              isActive: true,
              status: 'Present',
              isMarked: true,
              crossClassConflict: null,
            },
            {
              studentId: 'stu_2',
              fullName: 'Bhavna Verma',
              admissionNumber: null,
              isActive: true,
              status: null,
              isMarked: false,
              crossClassConflict: null,
            },
            {
              studentId: 'stu_3',
              fullName: 'Chetan Conflict',
              admissionNumber: null,
              isActive: true,
              status: null,
              isMarked: false,
              crossClassConflict: {
                className: 'Class 9',
                status: 'Present',
                message: 'Already marked Present in Class 9 for 2026-11-28',
              },
            },
            {
              studentId: 'unavailable:1',
              fullName: '',
              studentUnavailable: true,
              isActive: false,
              status: 'Absent',
              isMarked: true,
            },
          ],
          summary: {
            totalStudents: 4,
            presentCount: 1,
            absentCount: 1,
            unmarkedCount: 2,
            markedCount: 2,
            crossClassConflictCount: 1,
          },
        },
      },
    };

    const normalized = normalizeAttendanceSheetResponse(res);
    assert.equal(normalized.className, 'Class 8');
    assert.equal(normalized.students.length, 4);
    assert.equal(normalized.students[1].status, null);
    assert.equal(normalized.students[1].isMarked, false);
    assert.equal(normalized.students[3].fullName, 'Unavailable Student');
    assert.equal(normalized.summary.crossClassConflictCount, 1);

    assert.equal(getAttendanceStatusBadgeMeta(normalized.students[0]).label, 'Present');
    assert.equal(getAttendanceStatusBadgeMeta(normalized.students[1]).label, 'Not Marked');
    assert.equal(
      getAttendanceStatusBadgeMeta(normalized.students[2]).label,
      'Conflict (Class 9)'
    );
    assert.equal(getAttendanceStatusBadgeMeta(normalized.students[3]).label, 'Absent');
  });

  test('11. Handles empty class response and malformed payloads safely', () => {
    assert.equal(normalizeAttendanceSheetResponse(null), null);

    const empty = normalizeAttendanceSheetResponse({
      data: {
        sheet: {
          className: 'Class 9',
          attendanceDate: '2026-11-28',
          students: [],
          summary: {
            totalStudents: 0,
            presentCount: 0,
            absentCount: 0,
            unmarkedCount: 0,
            markedCount: 0,
            crossClassConflictCount: 0,
          },
        },
      },
    });
    assert.deepEqual(empty.students, []);
    assert.equal(empty.summary.totalStudents, 0);
  });

  test('12. Classifies 400, 401/403, 409, and 500/network errors accurately', () => {
    assert.equal(
      getAttendanceSheetErrorMessage({
        response: { status: 400, data: { message: 'Bad date' } },
      }),
      'Bad date'
    );
    assert.equal(
      getAttendanceSheetErrorMessage({ response: { status: 401 } }),
      'You are not authorized to view attendance records.'
    );
    assert.equal(
      getAttendanceSheetErrorMessage({ response: { status: 403 } }),
      'You are not authorized to view attendance records.'
    );
    assert.equal(
      getAttendanceSheetErrorMessage({
        response: { status: 409, data: { message: 'Conflict' } },
      }),
      'Conflict'
    );
    assert.equal(
      getAttendanceSheetErrorMessage(new Error('Network down')),
      'Network down'
    );
  });
});
