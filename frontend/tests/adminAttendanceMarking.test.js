import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isAttendanceRowEligible,
  initializeDraftAttendance,
  updateDraftAttendanceEntry,
  applyBulkDraftStatus,
  countQuickMarkOverwrites,
  hasUnsavedAttendanceChanges,
  computeDraftAttendanceSummary,
  getRowDraftIndicator,
} from '../src/utils/adminAttendanceMarkingUtils.js';

const sampleStudents = [
  {
    studentId: 'stu-1',
    fullName: 'Aarav Sharma',
    admissionNumber: 'SSG-2026-0001',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: true,
    isMarked: true,
    status: 'Present',
    studentUnavailable: false,
    crossClassConflict: null,
  },
  {
    studentId: 'stu-2',
    fullName: 'Diya Nair',
    admissionNumber: 'SSG-2026-0002',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: true,
    isMarked: false,
    status: null,
    studentUnavailable: false,
    crossClassConflict: null,
  },
  {
    studentId: 'stu-3',
    fullName: 'Kabir Patel',
    admissionNumber: 'SSG-2026-0003',
    currentClassName: 'Class 9',
    attendanceClassName: 'Class 8',
    isActive: false,
    isMarked: true,
    status: 'Absent',
    studentUnavailable: false,
    crossClassConflict: null,
  },
  {
    studentId: 'stu-4',
    fullName: 'Meera Iyer',
    admissionNumber: 'SSG-2026-0004',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: true,
    isMarked: false,
    status: null,
    studentUnavailable: false,
    crossClassConflict: {
      className: 'Class 9',
      status: 'Present',
      message: 'Already marked Present in Class 9 for this date.',
    },
  },
  {
    studentId: 'stu-5',
    fullName: 'Rohan Verma',
    admissionNumber: 'SSG-2026-0005',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: false,
    isMarked: false,
    status: null,
    studentUnavailable: false,
    crossClassConflict: null,
  },
  {
    studentId: 'stu-6',
    fullName: 'Unavailable Student',
    admissionNumber: null,
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: false,
    isMarked: true,
    status: 'Present',
    studentUnavailable: true,
    crossClassConflict: null,
  },
];

describe('Admin Attendance Marking Utilities Tests', () => {
  test('1. Determines row eligibility accurately for active, historical, conflict, and unavailable rows', () => {
    assert.equal(isAttendanceRowEligible(sampleStudents[0]), true); // active + marked
    assert.equal(isAttendanceRowEligible(sampleStudents[1]), true); // active + unmarked
    assert.equal(isAttendanceRowEligible(sampleStudents[2]), true); // historical marked + inactive/moved
    assert.equal(isAttendanceRowEligible(sampleStudents[3]), false); // cross-class conflict
    assert.equal(isAttendanceRowEligible(sampleStudents[4]), false); // inactive + unmarked
    assert.equal(isAttendanceRowEligible(sampleStudents[5]), false); // studentUnavailable
    assert.equal(isAttendanceRowEligible(null), false);
  });

  test('2. Initializes draft attendance from saved records for eligible rows only', () => {
    const draft = initializeDraftAttendance(sampleStudents);
    assert.deepEqual(draft, {
      'stu-1': 'Present',
      'stu-3': 'Absent',
    });
    assert.equal(draft['stu-2'], undefined);
    assert.equal(draft['stu-4'], undefined);
    assert.equal(draft['stu-6'], undefined);
  });

  test('3. Updates individual student draft status and toggles between Present and Absent', () => {
    const initial = initializeDraftAttendance(sampleStudents);
    const afterMark = updateDraftAttendanceEntry(initial, 'stu-2', 'Present', sampleStudents);
    assert.equal(afterMark['stu-2'], 'Present');

    const afterToggle = updateDraftAttendanceEntry(afterMark, 'stu-2', 'Absent', sampleStudents);
    assert.equal(afterToggle['stu-2'], 'Absent');
    assert.equal(initial['stu-2'], undefined); // immutable
  });

  test('4. Rejects invalid statuses or ineligible student rows during single-row update', () => {
    const initial = initializeDraftAttendance(sampleStudents);
    assert.equal(updateDraftAttendanceEntry(initial, 'stu-2', 'Late', sampleStudents), initial);
    assert.equal(updateDraftAttendanceEntry(initial, 'stu-4', 'Present', sampleStudents), initial);
    assert.equal(updateDraftAttendanceEntry(initial, 'stu-5', 'Absent', sampleStudents), initial);
    assert.equal(updateDraftAttendanceEntry(initial, 'stu-6', 'Absent', sampleStudents), initial);
  });

  test('5. Counts quick-mark overwrites only when eligible rows have conflicting selections', () => {
    const cleanRows = [
      { ...sampleStudents[1], studentId: 'a' },
      { ...sampleStudents[1], studentId: 'b' },
    ];
    assert.equal(countQuickMarkOverwrites(cleanRows, { a: 'Present' }, 'Present'), 0);
    assert.equal(countQuickMarkOverwrites(cleanRows, { a: 'Present' }, 'Absent'), 1);

    const mixedDraft = { 'stu-1': 'Present', 'stu-2': 'Present', 'stu-3': 'Absent' };
    assert.equal(countQuickMarkOverwrites(sampleStudents, mixedDraft, 'Present'), 1);
    assert.equal(countQuickMarkOverwrites(sampleStudents, mixedDraft, 'Absent'), 2);
  });

  test('6. Applies Mark All Present and Mark All Absent only to eligible rows', () => {
    const initial = initializeDraftAttendance(sampleStudents);
    const allPresent = applyBulkDraftStatus(sampleStudents, initial, 'Present');
    assert.deepEqual(allPresent, {
      'stu-1': 'Present',
      'stu-2': 'Present',
      'stu-3': 'Present',
    });

    const allAbsent = applyBulkDraftStatus(sampleStudents, allPresent, 'Absent');
    assert.deepEqual(allAbsent, {
      'stu-1': 'Absent',
      'stu-2': 'Absent',
      'stu-3': 'Absent',
    });
  });

  test('7. Detects unsaved changes accurately and clears flag when reverted to saved state', () => {
    const initial = initializeDraftAttendance(sampleStudents);
    assert.equal(hasUnsavedAttendanceChanges(sampleStudents, initial), false);

    const withNewMark = updateDraftAttendanceEntry(initial, 'stu-2', 'Present', sampleStudents);
    assert.equal(hasUnsavedAttendanceChanges(sampleStudents, withNewMark), true);

    const withModifiedMark = updateDraftAttendanceEntry(initial, 'stu-1', 'Absent', sampleStudents);
    assert.equal(hasUnsavedAttendanceChanges(sampleStudents, withModifiedMark), true);

    const reverted = updateDraftAttendanceEntry(withModifiedMark, 'stu-1', 'Present', sampleStudents);
    assert.equal(hasUnsavedAttendanceChanges(sampleStudents, reverted), false);
  });

  test('8. Computes live draft summary counts and excludes locked/conflict rows from unmarked', () => {
    const initial = initializeDraftAttendance(sampleStudents);
    const summaryInitial = computeDraftAttendanceSummary(sampleStudents, initial);
    assert.deepEqual(summaryInitial, {
      totalStudents: 6,
      eligibleCount: 3,
      presentCount: 1,
      absentCount: 1,
      unmarkedCount: 1,
      conflictCount: 1,
      modifiedCount: 0,
      pendingCount: 0,
    });

    let updated = updateDraftAttendanceEntry(initial, 'stu-2', 'Present', sampleStudents);
    updated = updateDraftAttendanceEntry(updated, 'stu-1', 'Absent', sampleStudents);
    const summaryUpdated = computeDraftAttendanceSummary(sampleStudents, updated);
    assert.deepEqual(summaryUpdated, {
      totalStudents: 6,
      eligibleCount: 3,
      presentCount: 1,
      absentCount: 2,
      unmarkedCount: 0,
      conflictCount: 1,
      modifiedCount: 1,
      pendingCount: 1,
    });
  });

  test('9. Returns accurate row-level draft indicators (Saved, Modified, Pending, Not Marked, Conflict, Unavailable, Inactive)', () => {
    assert.equal(getRowDraftIndicator(sampleStudents[0], 'Present').label, 'Saved');
    assert.equal(getRowDraftIndicator(sampleStudents[0], 'Absent').label, 'Modified');
    assert.equal(getRowDraftIndicator(sampleStudents[1], null).label, 'Not Marked');
    assert.equal(getRowDraftIndicator(sampleStudents[1], 'Present').label, 'Pending');
    assert.equal(getRowDraftIndicator(sampleStudents[3], null).label, 'Conflict');
    assert.equal(getRowDraftIndicator(sampleStudents[4], null).label, 'Inactive');
    assert.equal(getRowDraftIndicator(sampleStudents[5], null).label, 'Saved');
    assert.equal(
      getRowDraftIndicator({ ...sampleStudents[5], isMarked: false, status: null }, null).label,
      'Unavailable'
    );
  });
});
