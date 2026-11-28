import {
  ATTENDANCE_STATUSES,
  isAttendanceClass,
  isValidAttendanceDate,
  buildAttendanceBulkPayload,
} from './adminAttendanceUtils.js';

/**
 * Determine whether a sheet row represents an active student currently
 * belonging to the selected class (including rows that may have a conflict
 * or unavailable flag).
 */
export const isActiveRosterRow = (row, className) => {
  if (!row || !row.studentId) return false;
  if (!row.isActive) return false;
  if (row.currentClassName && row.currentClassName !== className) return false;
  return true;
};

/**
 * Return active roster rows in the selected class that cannot be safely
 * submitted because of a cross-class conflict or unavailable student state.
 */
export const getUnresolvedActiveRosterRows = (students = [], className) => {
  if (!Array.isArray(students)) return [];

  const seenIds = new Set();
  const unresolved = [];

  for (const row of students) {
    if (!row?.studentId) continue;
    if (seenIds.has(row.studentId)) continue;
    seenIds.add(row.studentId);

    if (!isActiveRosterRow(row, className)) continue;
    if (row.crossClassConflict || row.studentUnavailable) {
      unresolved.push(row);
    }
  }

  return unresolved;
};

/**
 * Determine whether a non-active or transferred historical row has an existing
 * attendance record for the selected class/date and has been modified in draft.
 */
export const isModifiedHistoricalRow = (row, className, draftStatus) => {
  if (!row || !row.studentId) return false;
  if (isActiveRosterRow(row, className)) return false;
  if (!row.isMarked) return false;
  if (row.crossClassConflict || row.studentUnavailable) return false;
  if (!ATTENDANCE_STATUSES.includes(draftStatus)) return false;
  return draftStatus !== row.status;
};

/**
 * Return all markable active students in the selected class who do not yet
 * have a valid Present or Absent draft status.
 */
export const getUnmarkedActiveStudents = (
  students = [],
  draftAttendance = {},
  className
) => {
  if (!Array.isArray(students)) return [];

  const seenIds = new Set();
  const unmarked = [];

  for (const row of students) {
    if (!row?.studentId) continue;
    if (seenIds.has(row.studentId)) continue;
    seenIds.add(row.studentId);

    if (!isActiveRosterRow(row, className)) continue;
    if (row.crossClassConflict || row.studentUnavailable) continue;

    const draftStatus = draftAttendance[row.studentId];
    if (!ATTENDANCE_STATUSES.includes(draftStatus)) {
      unmarked.push(row);
    }
  }

  return unmarked;
};

/**
 * Build and validate the bulk attendance submission payload from draft state.
 *
 * Enforces:
 * - Valid class ('Class 8' | 'Class 9') and non-future IST date (YYYY-MM-DD)
 * - No duplicate student IDs
 * - Every active student in the selected class is marked Present or Absent
 * - Complete active roster included in entries
 * - Historical inactive/transferred records included only when modified
 * - Cross-class conflicts, unavailable students, and unmarked inactive rows excluded
 */
export const buildBulkAttendanceSubmission = (
  { className, attendanceDate, students = [], draftAttendance = {} } = {},
  referenceDate = new Date()
) => {
  if (!isAttendanceClass(className)) {
    throw new Error('Attendance is only supported for Class 8 and Class 9.');
  }

  if (!isValidAttendanceDate(attendanceDate, referenceDate)) {
    throw new Error(
      'Attendance date must be a valid YYYY-MM-DD calendar date and cannot be in the future.'
    );
  }

  if (!Array.isArray(students) || students.length === 0) {
    throw new Error('No students available to save for this attendance sheet.');
  }

  const trimmedClass = className.trim();
  const seenIds = new Set();
  const activeRows = [];
  const historicalModifiedRows = [];

  for (const row of students) {
    if (!row) continue;
    if (row.studentId) {
      if (seenIds.has(row.studentId)) {
        throw new Error(
          `Duplicate student ID '${row.studentId}' detected in attendance sheet.`
        );
      }
      seenIds.add(row.studentId);
    }

    if (isActiveRosterRow(row, trimmedClass)) {
      activeRows.push(row);
      continue;
    }

    if (row.crossClassConflict || row.studentUnavailable) {
      continue;
    }

    if (
      isModifiedHistoricalRow(row, trimmedClass, draftAttendance[row.studentId])
    ) {
      historicalModifiedRows.push(row);
    }
  }

  const unresolvedActive = activeRows.filter(
    (row) => Boolean(row.crossClassConflict) || Boolean(row.studentUnavailable)
  );

  if (unresolvedActive.length > 0) {
    const affectedDetails = unresolvedActive
      .slice(0, 3)
      .map((row) => {
        const reason = row.crossClassConflict
          ? `cross-class conflict (${row.crossClassConflict.className || 'another class'})`
          : 'unavailable student record';
        return `${row.fullName || row.studentId} (${reason})`;
      })
      .join(', ');
    const moreCount =
      unresolvedActive.length > 3
        ? ` and ${unresolvedActive.length - 3} more`
        : '';

    throw new Error(
      `Cannot save attendance: the active roster contains ${unresolvedActive.length} unresolved student record(s): ${affectedDetails}${moreCount}. Resolve the issue and refresh the attendance sheet.`
    );
  }

  const unmarkedActive = activeRows.filter(
    (row) => !ATTENDANCE_STATUSES.includes(draftAttendance[row.studentId])
  );

  if (unmarkedActive.length > 0) {
    throw new Error(
      `Please mark attendance for all active students before saving. ${unmarkedActive.length} active student(s) remain unmarked.`
    );
  }

  const entries = [
    ...activeRows.map((row) => ({
      studentId: row.studentId,
      status: draftAttendance[row.studentId],
    })),
    ...historicalModifiedRows.map((row) => ({
      studentId: row.studentId,
      status: draftAttendance[row.studentId],
    })),
  ];

  if (entries.length === 0) {
    throw new Error('No eligible attendance entries to save.');
  }

  const payload = buildAttendanceBulkPayload(
    {
      className: trimmedClass,
      attendanceDate,
      entries,
    },
    referenceDate
  );

  return {
    payload,
    activeCount: activeRows.length,
    historicalCorrectionCount: historicalModifiedRows.length,
  };
};

/**
 * Determine whether an API error represents a stale roster / concurrency conflict.
 */
export const isStaleRosterError = (err) => {
  if (err?.response?.status !== 409) return false;
  const msg = String(err?.response?.data?.message || '').toLowerCase();
  return (
    msg.includes('roster') ||
    msg.includes('reload') ||
    msg.includes('missing') ||
    msg.includes('belongs to') ||
    msg.includes('inactive') ||
    msg.includes('conflict')
  );
};

/**
 * Extract a clear, actionable error message for failed attendance submissions.
 */
export const getAttendanceSaveErrorMessage = (err) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.message;

  if (isStaleRosterError(err)) {
    return `${
      apiMsg || 'The class roster or attendance records changed on the server.'
    } Your draft has been preserved — please refresh the attendance sheet before saving again.`;
  }

  if (status === 400) {
    return apiMsg || 'Invalid attendance submission. Please review your selections.';
  }
  if (status === 401 || status === 403) {
    return 'You are not authorized to save attendance records.';
  }
  if (status === 404) {
    return apiMsg || 'One or more students could not be found. Please refresh the sheet.';
  }
  if (status === 409) {
    return apiMsg || 'An attendance conflict occurred. Please refresh the sheet and try again.';
  }

  return apiMsg || err?.message || 'Failed to save attendance. Please try again.';
};

/**
 * Format a concise success message from the backend bulk save response.
 */
export const getAttendanceSaveSuccessMessage = (res) => {
  const summary = res?.data?.summary;
  if (summary && typeof summary === 'object') {
    const classLabel = summary.className || 'Class';
    const dateLabel = summary.attendanceDate ? ` (${summary.attendanceDate})` : '';
    const present = Number(summary.presentCount) || 0;
    const absent = Number(summary.absentCount) || 0;
    return `Attendance saved for ${classLabel}${dateLabel}: ${present} Present, ${absent} Absent.`;
  }

  return res?.message || 'Attendance saved successfully.';
};
