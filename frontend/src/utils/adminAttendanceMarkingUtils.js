import { ATTENDANCE_STATUSES } from './adminAttendanceUtils.js';

/**
 * Determine whether a daily attendance sheet row can be marked or edited
 * in the current class sheet.
 *
 * Eligible rows:
 * - Active students belonging to the selected class without cross-class conflict
 * - Historical rows that already have a saved attendance record (even if
 *   subsequently deactivated or moved to another class), unless unavailable or
 *   in a cross-class conflict
 */
export const isAttendanceRowEligible = (row) => {
  if (!row || !row.studentId) return false;
  if (row.crossClassConflict) return false;
  if (row.studentUnavailable) return false;
  if (!row.isActive && !row.isMarked) return false;
  return true;
};

/**
 * Initialize draft attendance state from loaded daily sheet rows.
 * Only rows with a valid saved status ('Present' | 'Absent') are populated.
 */
export const initializeDraftAttendance = (students = []) => {
  const draft = {};
  if (!Array.isArray(students)) return draft;

  for (const row of students) {
    if (!isAttendanceRowEligible(row)) continue;
    if (row.isMarked && ATTENDANCE_STATUSES.includes(row.status)) {
      draft[row.studentId] = row.status;
    }
  }

  return draft;
};

/**
 * Return a new draft attendance map with a single student's status updated.
 */
export const updateDraftAttendanceEntry = (
  draftAttendance = {},
  studentId,
  status,
  students = null
) => {
  if (!studentId || !ATTENDANCE_STATUSES.includes(status)) {
    return draftAttendance;
  }

  if (Array.isArray(students)) {
    const row = students.find((item) => item?.studentId === studentId);
    if (!isAttendanceRowEligible(row)) {
      return draftAttendance;
    }
  }

  if (draftAttendance[studentId] === status) {
    return draftAttendance;
  }

  return {
    ...draftAttendance,
    [studentId]: status,
  };
};

/**
 * Count how many eligible rows already have a different draft selection
 * that would be overwritten by a bulk Mark All action.
 */
export const countQuickMarkOverwrites = (
  students = [],
  draftAttendance = {},
  targetStatus
) => {
  if (!Array.isArray(students) || !ATTENDANCE_STATUSES.includes(targetStatus)) {
    return 0;
  }

  let overwrites = 0;
  for (const row of students) {
    if (!isAttendanceRowEligible(row)) continue;
    const current = draftAttendance[row.studentId];
    if (ATTENDANCE_STATUSES.includes(current) && current !== targetStatus) {
      overwrites += 1;
    }
  }

  return overwrites;
};

/**
 * Apply a bulk status ('Present' | 'Absent') to all eligible rows in draft state.
 * Ineligible rows (cross-class conflicts, unavailable, or unmarked inactive) are untouched.
 */
export const applyBulkDraftStatus = (
  students = [],
  draftAttendance = {},
  targetStatus
) => {
  if (!Array.isArray(students) || !ATTENDANCE_STATUSES.includes(targetStatus)) {
    return draftAttendance;
  }

  const nextDraft = { ...draftAttendance };
  for (const row of students) {
    if (!isAttendanceRowEligible(row)) continue;
    nextDraft[row.studentId] = targetStatus;
  }

  return nextDraft;
};

/**
 * Determine whether any eligible row's draft status differs from its saved sheet status.
 */
export const hasUnsavedAttendanceChanges = (
  students = [],
  draftAttendance = {}
) => {
  if (!Array.isArray(students)) return false;

  for (const row of students) {
    if (!isAttendanceRowEligible(row)) continue;
    const savedStatus =
      row.isMarked && ATTENDANCE_STATUSES.includes(row.status) ? row.status : null;
    const draftStatus = ATTENDANCE_STATUSES.includes(draftAttendance[row.studentId])
      ? draftAttendance[row.studentId]
      : null;

    if (draftStatus !== savedStatus) {
      return true;
    }
  }

  return false;
};

/**
 * Compute live summary counts from the current sheet rows and draft selections.
 */
export const computeDraftAttendanceSummary = (
  students = [],
  draftAttendance = {}
) => {
  if (!Array.isArray(students)) {
    return {
      totalStudents: 0,
      eligibleCount: 0,
      presentCount: 0,
      absentCount: 0,
      unmarkedCount: 0,
      conflictCount: 0,
      modifiedCount: 0,
      pendingCount: 0,
    };
  }

  const seenIds = new Set();
  let totalStudents = 0;
  let eligibleCount = 0;
  let presentCount = 0;
  let absentCount = 0;
  let unmarkedCount = 0;
  let conflictCount = 0;
  let modifiedCount = 0;
  let pendingCount = 0;

  for (const row of students) {
    if (!row) continue;
    if (row.studentId) {
      if (seenIds.has(row.studentId)) continue;
      seenIds.add(row.studentId);
    }

    totalStudents += 1;

    if (row.crossClassConflict) {
      conflictCount += 1;
    }

    if (!isAttendanceRowEligible(row)) {
      continue;
    }

    eligibleCount += 1;
    const draftStatus = ATTENDANCE_STATUSES.includes(draftAttendance[row.studentId])
      ? draftAttendance[row.studentId]
      : null;

    if (draftStatus === 'Present') {
      presentCount += 1;
    } else if (draftStatus === 'Absent') {
      absentCount += 1;
    } else {
      unmarkedCount += 1;
    }

    if (row.isMarked) {
      if (draftStatus !== row.status) {
        modifiedCount += 1;
      }
    } else if (draftStatus !== null) {
      pendingCount += 1;
    }
  }

  return {
    totalStudents,
    eligibleCount,
    presentCount,
    absentCount,
    unmarkedCount,
    conflictCount,
    modifiedCount,
    pendingCount,
  };
};

/**
 * Get the row-level draft/save indicator metadata for UI rendering.
 */
export const getRowDraftIndicator = (row, draftStatus = null) => {
  if (row?.crossClassConflict) {
    return {
      key: 'conflict',
      label: 'Conflict',
      badgeClass: 'bg-[#FFF3CD] text-[#7A5600] border-[#E8D28C]',
    };
  }

  if (row?.studentUnavailable) {
    if (row.isMarked && ATTENDANCE_STATUSES.includes(row.status)) {
      return {
        key: 'saved',
        label: 'Saved',
        badgeClass: 'bg-[#EEF5F0] text-[#1A5D3A] border-[#C5DEC9]',
      };
    }
    return {
      key: 'unavailable',
      label: 'Unavailable',
      badgeClass: 'bg-[#F4EFE3] text-[#6B706B] border-[#E5DEC9]',
    };
  }

  if (!row?.isActive && !row?.isMarked) {
    return {
      key: 'ineligible',
      label: 'Inactive',
      badgeClass: 'bg-[#F4EFE3] text-[#6B706B] border-[#E5DEC9]',
    };
  }

  const normalizedDraft = ATTENDANCE_STATUSES.includes(draftStatus)
    ? draftStatus
    : null;

  if (row?.isMarked) {
    if (normalizedDraft === row.status) {
      return {
        key: 'saved',
        label: 'Saved',
        badgeClass: 'bg-[#EEF5F0] text-[#1A5D3A] border-[#C5DEC9]',
      };
    }
    return {
      key: 'modified',
      label: 'Modified',
      badgeClass: 'bg-[#FFF8E6] text-[#946200] border-[#E8D28C]',
    };
  }

  if (normalizedDraft) {
    return {
      key: 'pending',
      label: 'Pending',
      badgeClass: 'bg-[#E8F1FF] text-[#1D4ED8] border-[#BFDBFE]',
    };
  }

  return {
    key: 'not_marked',
    label: 'Not Marked',
    badgeClass: 'bg-[#F4EFE3] text-[#6B706B] border-[#E5DEC9]',
  };
};
