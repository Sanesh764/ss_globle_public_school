import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  isActiveRosterRow,
  isModifiedHistoricalRow,
  getUnmarkedActiveStudents,
  getUnresolvedActiveRosterRows,
  buildBulkAttendanceSubmission,
  isStaleRosterError,
  getAttendanceSaveErrorMessage,
  getAttendanceSaveSuccessMessage,
} from '../src/utils/adminAttendanceSubmissionUtils.js';
import {
  initializeDraftAttendance,
  updateDraftAttendanceEntry,
  hasUnsavedAttendanceChanges,
  getRowDraftIndicator,
} from '../src/utils/adminAttendanceMarkingUtils.js';

const ID_1 = '65f1a0000000000000000001';
const ID_2 = '65f1a0000000000000000002';
const ID_3 = '65f1a0000000000000000003';
const ID_4 = '65f1a0000000000000000004';
const ID_5 = '65f1a0000000000000000005';
const ID_6 = '65f1a0000000000000000006';
const ID_7 = '65f1a0000000000000000007';

const REF_DATE = new Date('2026-11-28T10:00:00.000Z');
const TODAY_IST = '2026-11-28';

const buildSampleSheet = () => [
  {
    studentId: ID_1,
    fullName: 'Aarav Sharma',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: true,
    isMarked: true,
    status: 'Present',
    studentUnavailable: false,
    crossClassConflict: null,
  },
  {
    studentId: ID_2,
    fullName: 'Diya Nair',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: true,
    isMarked: false,
    status: null,
    studentUnavailable: false,
    crossClassConflict: null,
  },
  {
    studentId: ID_3,
    fullName: 'Kabir Patel (Inactive Marked)',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: false,
    isMarked: true,
    status: 'Absent',
    studentUnavailable: false,
    crossClassConflict: null,
  },
  {
    studentId: ID_4,
    fullName: 'Sana Khan (Transferred Marked)',
    currentClassName: 'Class 9',
    attendanceClassName: 'Class 8',
    isActive: true,
    isMarked: true,
    status: 'Present',
    studentUnavailable: false,
    crossClassConflict: null,
  },
  {
    studentId: ID_5,
    fullName: 'Meera Iyer (Historical Conflict)',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: false,
    isMarked: false,
    status: null,
    studentUnavailable: false,
    crossClassConflict: {
      className: 'Class 9',
      status: 'Present',
      message: 'Already marked Present in Class 9.',
    },
  },
  {
    studentId: ID_6,
    fullName: 'Unavailable Student',
    currentClassName: null,
    attendanceClassName: 'Class 8',
    isActive: false,
    isMarked: true,
    status: 'Present',
    studentUnavailable: true,
    crossClassConflict: null,
  },
  {
    studentId: ID_7,
    fullName: 'Rohan Verma (Inactive Unmarked)',
    currentClassName: 'Class 8',
    attendanceClassName: 'Class 8',
    isActive: false,
    isMarked: false,
    status: null,
    studentUnavailable: false,
    crossClassConflict: null,
  },
];

describe('Admin Attendance Submission Utilities & Lifecycle Tests', () => {
  test('1-2. Complete active roster creates valid payload including unchanged active students', () => {
    const students = buildSampleSheet();
    let draft = initializeDraftAttendance(students);
    draft = updateDraftAttendanceEntry(draft, ID_2, 'Absent', students);

    const { payload, activeCount, historicalCorrectionCount } =
      buildBulkAttendanceSubmission(
        {
          className: 'Class 8',
          attendanceDate: TODAY_IST,
          students,
          draftAttendance: draft,
        },
        REF_DATE
      );

    assert.equal(activeCount, 2);
    assert.equal(historicalCorrectionCount, 0);
    assert.deepEqual(payload, {
      className: 'Class 8',
      attendanceDate: TODAY_IST,
      entries: [
        { studentId: ID_1, status: 'Present' }, // unchanged active row still included
        { studentId: ID_2, status: 'Absent' },
      ],
    });
  });

  test('3-4. Unmarked active students block submission and are never auto-marked Absent', () => {
    const students = buildSampleSheet();
    const draft = initializeDraftAttendance(students); // ID_2 is unmarked

    const unmarked = getUnmarkedActiveStudents(students, draft, 'Class 8');
    assert.equal(unmarked.length, 1);
    assert.equal(unmarked[0].studentId, ID_2);

    assert.throws(
      () =>
        buildBulkAttendanceSubmission(
          {
            className: 'Class 8',
            attendanceDate: TODAY_IST,
            students,
            draftAttendance: draft,
          },
          REF_DATE
        ),
      /1 active student\(s\) remain unmarked/
    );
    assert.equal(draft[ID_2], undefined);
  });

  test('5-6. Modified historical inactive/transferred records are included; unchanged ones are excluded', () => {
    const students = buildSampleSheet();
    let draft = initializeDraftAttendance(students);
    draft = updateDraftAttendanceEntry(draft, ID_2, 'Present', students);
    // Modify ID_3 (inactive marked) from Absent -> Present; leave ID_4 (transferred marked) unchanged
    draft = updateDraftAttendanceEntry(draft, ID_3, 'Present', students);

    assert.equal(isActiveRosterRow(students[2], 'Class 8'), false);
    assert.equal(isModifiedHistoricalRow(students[2], 'Class 8', 'Present'), true);
    assert.equal(isModifiedHistoricalRow(students[3], 'Class 8', 'Present'), false);

    const { payload, historicalCorrectionCount } = buildBulkAttendanceSubmission(
      {
        className: 'Class 8',
        attendanceDate: TODAY_IST,
        students,
        draftAttendance: draft,
      },
      REF_DATE
    );

    assert.equal(historicalCorrectionCount, 1);
    assert.deepEqual(payload.entries, [
      { studentId: ID_1, status: 'Present' },
      { studentId: ID_2, status: 'Present' },
      { studentId: ID_3, status: 'Present' },
    ]);
    assert.equal(
      payload.entries.some((e) => e.studentId === ID_4),
      false
    );
  });

  test('7-9. Excludes cross-class conflicts, unavailable students, and unmarked inactive rows', () => {
    const students = buildSampleSheet();
    let draft = initializeDraftAttendance(students);
    draft = updateDraftAttendanceEntry(draft, ID_2, 'Present', students);
    // Even if draft somehow had entries for excluded IDs
    const pollutedDraft = {
      ...draft,
      [ID_5]: 'Present',
      [ID_6]: 'Absent',
      [ID_7]: 'Present',
    };

    const { payload } = buildBulkAttendanceSubmission(
      {
        className: 'Class 8',
        attendanceDate: TODAY_IST,
        students,
        draftAttendance: pollutedDraft,
      },
      REF_DATE
    );

    const submittedIds = payload.entries.map((e) => e.studentId);
    assert.equal(submittedIds.includes(ID_5), false);
    assert.equal(submittedIds.includes(ID_6), false);
    assert.equal(submittedIds.includes(ID_7), false);
  });

  test('10-12. Rejects duplicate student IDs, invalid statuses, and invalid class/date', () => {
    const students = buildSampleSheet();
    const dupStudents = [students[0], { ...students[0] }, students[1]];
    const draft = { [ID_1]: 'Present', [ID_2]: 'Absent' };

    assert.throws(
      () =>
        buildBulkAttendanceSubmission(
          {
            className: 'Class 8',
            attendanceDate: TODAY_IST,
            students: dupStudents,
            draftAttendance: draft,
          },
          REF_DATE
        ),
      /Duplicate student ID/
    );

    assert.throws(
      () =>
        buildBulkAttendanceSubmission(
          {
            className: 'Class 8',
            attendanceDate: TODAY_IST,
            students: [students[0], students[1]],
            draftAttendance: { [ID_1]: 'Late', [ID_2]: 'Present' },
          },
          REF_DATE
        ),
      /unmarked/i
    );

    assert.throws(
      () =>
        buildBulkAttendanceSubmission(
          {
            className: 'Class 10',
            attendanceDate: TODAY_IST,
            students: [students[0], students[1]],
            draftAttendance: draft,
          },
          REF_DATE
        ),
      /Class 8 and Class 9/
    );

    assert.throws(
      () =>
        buildBulkAttendanceSubmission(
          {
            className: 'Class 8',
            attendanceDate: '2026-11-29',
            students: [students[0], students[1]],
            draftAttendance: draft,
          },
          REF_DATE
        ),
      /future/i
    );
  });

  test('13-19. Submission lifecycle: refreshes server sheet, clears dirty state, preserves draft on failure, and blocks concurrent saves', async () => {
    const initialStudents = [
      { ...buildSampleSheet()[0], isMarked: true, status: 'Present' },
      { ...buildSampleSheet()[1], isMarked: false, status: null },
    ];
    let draft = initializeDraftAttendance(initialStudents);
    draft = updateDraftAttendanceEntry(draft, ID_2, 'Absent', initialStudents);

    assert.equal(hasUnsavedAttendanceChanges(initialStudents, draft), true);

    // Simulate failed stale-roster save -> draft preserved, saving reset
    const staleErr = {
      response: {
        status: 409,
        data: {
          message:
            'Attendance roster changed or submission is incomplete: 1 active student(s) in Class 8 are missing. Please reload the attendance sheet.',
        },
      },
    };
    assert.equal(isStaleRosterError(staleErr), true);
    const staleMsg = getAttendanceSaveErrorMessage(staleErr);
    assert.match(staleMsg, /draft has been preserved/i);
    assert.match(staleMsg, /refresh the attendance sheet/i);
    assert.equal(draft[ID_2], 'Absent');
    assert.equal(hasUnsavedAttendanceChanges(initialStudents, draft), true);

    // Simulate concurrent click guard & successful save + server refresh
    let savingInFlight = false;
    let apiCallCount = 0;
    let sheet = initialStudents;

    const runSave = async () => {
      if (savingInFlight) return 'blocked';
      const { payload } = buildBulkAttendanceSubmission(
        {
          className: 'Class 8',
          attendanceDate: TODAY_IST,
          students: sheet,
          draftAttendance: draft,
        },
        REF_DATE
      );
      savingInFlight = true;
      try {
        apiCallCount += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        const res = {
          data: {
            summary: {
              className: payload.className,
              attendanceDate: payload.attendanceDate,
              presentCount: 1,
              absentCount: 1,
            },
          },
        };
        // Refresh from server response
        sheet = [
          { ...initialStudents[0], isMarked: true, status: 'Present' },
          { ...initialStudents[1], isMarked: true, status: 'Absent' },
        ];
        draft = initializeDraftAttendance(sheet);
        return getAttendanceSaveSuccessMessage(res);
      } finally {
        savingInFlight = false;
      }
    };

    const [firstResult, secondResult] = await Promise.all([runSave(), runSave()]);
    assert.equal(apiCallCount, 1);
    assert.match(firstResult, /Attendance saved for Class 8/);
    assert.equal(secondResult, 'blocked');
    assert.equal(savingInFlight, false);
    assert.equal(hasUnsavedAttendanceChanges(sheet, draft), false);
    assert.equal(getRowDraftIndicator(sheet[0], draft[ID_1]).label, 'Saved');
    assert.equal(getRowDraftIndicator(sheet[1], draft[ID_2]).label, 'Saved');
  });

  test('20. Formats fallback save error and success messages cleanly', () => {
    assert.equal(
      getAttendanceSaveErrorMessage(new Error('Network Error')),
      'Network Error'
    );
    assert.equal(
      getAttendanceSaveErrorMessage({ response: { status: 403 } }),
      'You are not authorized to save attendance records.'
    );
    assert.equal(
      getAttendanceSaveSuccessMessage({ message: 'Attendance saved successfully.' }),
      'Attendance saved successfully.'
    );
  });

  test('21. Active student with crossClassConflict blocks submission, identifies student, and preserves draft', () => {
    const students = [
      ...buildSampleSheet().slice(0, 2),
      {
        studentId: ID_5,
        fullName: 'Active Conflict Student',
        currentClassName: 'Class 8',
        attendanceClassName: null,
        isActive: true,
        isMarked: false,
        status: null,
        studentUnavailable: false,
        crossClassConflict: {
          className: 'Class 9',
          status: 'Present',
          message: 'Already marked Present in Class 9.',
        },
      },
    ];

    let draft = initializeDraftAttendance(students);
    draft = updateDraftAttendanceEntry(draft, ID_2, 'Present', students);
    const draftBefore = { ...draft };

    const unresolved = getUnresolvedActiveRosterRows(students, 'Class 8');
    assert.equal(unresolved.length, 1);
    assert.equal(unresolved[0].studentId, ID_5);

    assert.throws(
      () =>
        buildBulkAttendanceSubmission(
          {
            className: 'Class 8',
            attendanceDate: TODAY_IST,
            students,
            draftAttendance: draft,
          },
          REF_DATE
        ),
      /unresolved student record.*Active Conflict Student.*cross-class conflict \(Class 9\)/
    );

    assert.deepEqual(draft, draftBefore);
  });

  test('22. Active student with studentUnavailable blocks submission, identifies student, and preserves draft', () => {
    const students = [
      ...buildSampleSheet().slice(0, 2),
      {
        studentId: ID_6,
        fullName: 'Active Unavailable Student',
        currentClassName: 'Class 8',
        attendanceClassName: null,
        isActive: true,
        isMarked: false,
        status: null,
        studentUnavailable: true,
        crossClassConflict: null,
      },
    ];

    let draft = initializeDraftAttendance(students);
    draft = updateDraftAttendanceEntry(draft, ID_2, 'Absent', students);
    const draftBefore = { ...draft };

    const unresolved = getUnresolvedActiveRosterRows(students, 'Class 8');
    assert.equal(unresolved.length, 1);
    assert.equal(unresolved[0].studentId, ID_6);

    assert.throws(
      () =>
        buildBulkAttendanceSubmission(
          {
            className: 'Class 8',
            attendanceDate: TODAY_IST,
            students,
            draftAttendance: draft,
          },
          REF_DATE
        ),
      /unresolved student record.*Active Unavailable Student.*unavailable student record/
    );

    assert.deepEqual(draft, draftBefore);
  });
});
