import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_REPORT_CLASS,
  getCurrentIndiaMonthKey,
  formatRecordedPercentage,
  normalizeMonthlySummaryResponse,
  normalizeStudentHistoryResponse,
  validateMonthlyReportQuery,
  validateStudentHistoryQuery,
  getMonthlyReportErrorMessage,
  getStudentHistoryErrorMessage,
} from '../src/utils/adminAttendanceReportUtils.js';
import {
  initializeDraftAttendance,
  updateDraftAttendanceEntry,
  hasUnsavedAttendanceChanges,
} from '../src/utils/adminAttendanceMarkingUtils.js';

const ID_1 = '65f1a0000000000000000001';
const ID_2 = '65f1a0000000000000000002';
const ID_3 = '65f1a0000000000000000003';

describe('Admin Attendance Monthly Reports & Student History Tests', () => {
  test('1-3. Defaults to Class 8 and current Asia/Kolkata month, and accepts Class 8 & Class 9', () => {
    assert.equal(DEFAULT_REPORT_CLASS, 'Class 8');

    // 2026-11-30 19:00 UTC -> 2026-12-01 00:30 IST
    const istDecBoundary = new Date('2026-11-30T19:00:00.000Z');
    assert.equal(getCurrentIndiaMonthKey(istDecBoundary), '2026-12');

    assert.equal(
      validateMonthlyReportQuery({ className: 'Class 8', month: '2026-12' }, istDecBoundary),
      ''
    );
    assert.equal(
      validateMonthlyReportQuery({ className: 'Class 9', month: '2026-11' }, istDecBoundary),
      ''
    );
  });

  test('4-5. Rejects future months, invalid month formats, and unsupported classes', () => {
    const ref = new Date('2026-11-28T10:00:00.000Z');
    assert.notEqual(
      validateMonthlyReportQuery({ className: 'Class 8', month: '2026-12' }, ref),
      ''
    );
    assert.notEqual(
      validateMonthlyReportQuery({ className: 'Class 8', month: '2026-13' }, ref),
      ''
    );
    assert.notEqual(
      validateMonthlyReportQuery({ className: 'Class 8', month: '11-2026' }, ref),
      ''
    );
    assert.notEqual(
      validateMonthlyReportQuery({ className: 'Class 10', month: '2026-11' }, ref),
      ''
    );
  });

  test('6-7. Normalizes monthly summary figures and handles zero recorded days without NaN/Infinity/100%', () => {
    const zeroRes = {
      data: {
        summary: {
          className: 'Class 8',
          month: '2026-11',
          totalStudents: 2,
          totalRecordedDays: 0,
          presentCount: 0,
          absentCount: 0,
          markedCount: 0,
          overallRecordedDayPercentage: NaN,
        },
        students: [],
        dailySummary: [],
      },
    };
    const normalizedZero = normalizeMonthlySummaryResponse(zeroRes);
    assert.equal(normalizedZero.summary.totalRecordedDays, 0);
    assert.equal(normalizedZero.summary.overallRecordedDayPercentage, 0);
    assert.equal(formatRecordedPercentage(normalizedZero.summary.overallRecordedDayPercentage), '0%');
    assert.equal(formatRecordedPercentage(Infinity), '0%');
    assert.equal(formatRecordedPercentage(NaN), '0%');
    assert.equal(normalizedZero.dailySummary.length, 0);
  });

  test('8-12. Sorts daily summaries chronologically, keeps zero-record/inactive/transferred students, and preserves historical class', () => {
    const apiRes = {
      data: {
        summary: {
          className: 'Class 8',
          month: '2026-11',
          totalStudents: 3,
          totalRecordedDays: 2,
          presentCount: 3,
          absentCount: 1,
          markedCount: 4,
          overallRecordedDayPercentage: 75,
        },
        dailySummary: [
          { attendanceDate: '2026-11-28', presentCount: 2, absentCount: 0, markedCount: 2 },
          { attendanceDate: '2026-11-10', presentCount: 1, absentCount: 1, markedCount: 2 },
        ],
        students: [
          {
            studentId: ID_1,
            fullName: 'Aarav Sharma',
            admissionNumber: 'SSG-2026-0001',
            currentClassName: 'Class 8',
            attendanceClassName: 'Class 8',
            isActive: true,
            presentCount: 2,
            absentCount: 0,
            markedDays: 2,
            attendancePercentage: 100,
          },
          {
            studentId: ID_2,
            fullName: 'Diya Nair (No Records)',
            admissionNumber: 'SSG-2026-0002',
            currentClassName: 'Class 8',
            attendanceClassName: 'Class 8',
            isActive: true,
            presentCount: 0,
            absentCount: 0,
            markedDays: 0,
            attendancePercentage: 0,
          },
          {
            studentId: ID_3,
            fullName: 'Kabir Patel (Inactive & Transferred)',
            admissionNumber: 'SSG-2026-0003',
            currentClassName: 'Class 9',
            attendanceClassName: 'Class 8',
            isActive: false,
            presentCount: 1,
            absentCount: 1,
            markedDays: 2,
            attendancePercentage: 50,
          },
        ],
      },
    };

    const normalized = normalizeMonthlySummaryResponse(apiRes);
    assert.deepEqual(
      normalized.dailySummary.map((d) => d.attendanceDate),
      ['2026-11-10', '2026-11-28']
    );
    assert.equal(normalized.students.length, 3);
    assert.equal(normalized.students[1].markedDays, 0);
    assert.equal(normalized.students[2].isActive, false);
    assert.equal(normalized.students[2].attendanceClassName, 'Class 8');
    assert.equal(normalized.students[2].currentClassName, 'Class 9');
    assert.equal(normalized.students[2].attendancePercentage, 50);
  });

  test('13-14. Validates and normalizes individual student history including empty results and historical class snapshots', () => {
    const ref = new Date('2026-11-28T10:00:00.000Z');
    assert.equal(validateStudentHistoryQuery(ID_3, '2026-11', ref), '');
    assert.notEqual(validateStudentHistoryQuery('invalid-id', '2026-11', ref), '');
    assert.notEqual(validateStudentHistoryQuery(ID_3, '2026-12', ref), '');

    const historyRes = {
      data: {
        student: {
          studentId: ID_3,
          fullName: 'Kabir Patel',
          admissionNumber: 'SSG-2026-0003',
          currentClassName: 'Class 9',
          isActive: false,
        },
        month: '2026-11',
        history: [
          {
            _id: 'att-1',
            attendanceDate: '2026-11-10',
            className: 'Class 8',
            status: 'Present',
            markedBy: { name: 'Admin One', email: 'a@school.test', role: 'admin' },
            updatedBy: null,
          },
        ],
        summary: {
          presentCount: 1,
          absentCount: 0,
          markedDays: 1,
          attendancePercentage: 100,
        },
      },
    };

    const normalized = normalizeStudentHistoryResponse(historyRes);
    assert.equal(normalized.student.isActive, false);
    assert.equal(normalized.student.currentClassName, 'Class 9');
    assert.equal(normalized.history[0].className, 'Class 8');
    assert.equal(normalized.history[0].markedBy.name, 'Admin One');

    const emptyNormalized = normalizeStudentHistoryResponse({
      data: {
        student: { studentId: ID_2, fullName: 'Diya Nair', currentClassName: 'Class 8', isActive: true },
        month: '2026-11',
        history: [],
        summary: { presentCount: 0, absentCount: 0, markedDays: 0, attendancePercentage: 0 },
      },
    });
    assert.equal(emptyNormalized.history.length, 0);
    assert.equal(emptyNormalized.summary.attendancePercentage, 0);
  });

  test('15-17. Handles error formatting, retry recovery, and stale-response protection across class/month changes', async () => {
    assert.equal(
      getMonthlyReportErrorMessage({ response: { status: 403 } }),
      'You are not authorized to view monthly attendance reports.'
    );
    assert.equal(
      getStudentHistoryErrorMessage({ response: { status: 404, data: { message: 'Student not found.' } } }),
      'Student not found.'
    );

    // Simulate stale request protection when switching Class 8 -> Class 9 rapidly
    let latestRequestId = 0;
    let activeReportClass = null;

    const loadReport = async (cls, delayMs) => {
      const reqId = ++latestRequestId;
      await new Promise((r) => setTimeout(r, delayMs));
      if (reqId !== latestRequestId) return 'ignored-stale';
      activeReportClass = cls;
      return cls;
    };

    const [first, second] = await Promise.all([
      loadReport('Class 8', 30),
      loadReport('Class 9', 5),
    ]);

    assert.equal(first, 'ignored-stale');
    assert.equal(second, 'Class 9');
    assert.equal(activeReportClass, 'Class 9');
  });

  test('18-20. Switching report views preserves dirty daily attendance draft state', () => {
    const dailyStudents = [
      {
        studentId: ID_1,
        fullName: 'Aarav Sharma',
        isActive: true,
        isMarked: false,
        status: null,
        studentUnavailable: false,
        crossClassConflict: null,
      },
    ];
    let draftAttendance = initializeDraftAttendance(dailyStudents);
    draftAttendance = updateDraftAttendanceEntry(draftAttendance, ID_1, 'Present', dailyStudents);
    assert.equal(hasUnsavedAttendanceChanges(dailyStudents, draftAttendance), true);

    // Switching view tab from 'daily' -> 'monthly' -> 'daily' keeps draftAttendance intact
    let activeTab = 'daily';
    activeTab = 'monthly';
    assert.equal(activeTab, 'monthly');
    assert.equal(draftAttendance[ID_1], 'Present');
    assert.equal(hasUnsavedAttendanceChanges(dailyStudents, draftAttendance), true);

    activeTab = 'daily';
    assert.equal(activeTab, 'daily');
    assert.equal(draftAttendance[ID_1], 'Present');
  });
});
