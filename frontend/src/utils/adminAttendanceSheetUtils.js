import { ATTENDANCE_CLASS_OPTIONS } from './adminAttendanceUtils.js';

export const DEFAULT_ATTENDANCE_CLASS = ATTENDANCE_CLASS_OPTIONS[0];

export const normalizeAttendanceSheetResponse = (res) => {
  const rawSheet = res?.data?.sheet;
  if (!rawSheet || typeof rawSheet !== 'object') {
    return null;
  }

  const rawStudents = Array.isArray(rawSheet.students) ? rawSheet.students : [];
  const students = rawStudents.map((row) => ({
    studentId: row.studentId || '',
    fullName: row.studentUnavailable
      ? row.fullName || 'Unavailable Student'
      : row.fullName || 'Unavailable Student',
    admissionNumber:
      typeof row.admissionNumber === 'string' && row.admissionNumber.trim() !== ''
        ? row.admissionNumber.trim()
        : null,
    photoUrl: typeof row.photo?.url === 'string' ? row.photo.url.trim() : '',
    isActive: Boolean(row.isActive),
    currentClassName: row.currentClassName || null,
    attendanceClassName: row.attendanceClassName || null,
    studentUnavailable: Boolean(row.studentUnavailable),
    status: row.status === 'Present' || row.status === 'Absent' ? row.status : null,
    isMarked: Boolean(row.isMarked),
    crossClassConflict:
      row.crossClassConflict && typeof row.crossClassConflict === 'object'
        ? {
            className: row.crossClassConflict.className || '',
            status: row.crossClassConflict.status || '',
            message:
              row.crossClassConflict.message ||
              'Already marked in another class for this date.',
          }
        : null,
    attendance: row.attendance || null,
  }));

  const rawSummary = rawSheet.summary || {};
  const summary = {
    totalStudents: Number(rawSummary.totalStudents) || 0,
    presentCount: Number(rawSummary.presentCount) || 0,
    absentCount: Number(rawSummary.absentCount) || 0,
    unmarkedCount: Number(rawSummary.unmarkedCount) || 0,
    markedCount: Number(rawSummary.markedCount) || 0,
    crossClassConflictCount: Number(rawSummary.crossClassConflictCount) || 0,
  };

  return {
    className: rawSheet.className || '',
    attendanceDate: rawSheet.attendanceDate || '',
    students,
    summary,
  };
};

export const getAttendanceSheetErrorMessage = (err) => {
  const status = err?.response?.status;
  const apiMsg = err?.response?.data?.message;

  if (status === 400) {
    return apiMsg || 'Invalid class or attendance date.';
  }
  if (status === 401 || status === 403) {
    return 'You are not authorized to view attendance records.';
  }
  if (status === 409) {
    return apiMsg || 'A conflict occurred while loading this attendance sheet.';
  }
  return apiMsg || err?.message || 'Failed to load daily attendance sheet. Please try again.';
};

export const getAttendanceStatusBadgeMeta = (row = {}) => {
  if (row.crossClassConflict) {
    return {
      label: `Conflict (${row.crossClassConflict.className || 'Other Class'})`,
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
      recordLabel: 'Conflict',
    };
  }

  if (row.status === 'Present') {
    return {
      label: 'Present',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      recordLabel: row.isMarked ? 'Saved' : 'Pending',
    };
  }

  if (row.status === 'Absent') {
    return {
      label: 'Absent',
      badgeClass: 'bg-rose-100 text-rose-800 border-rose-300',
      recordLabel: row.isMarked ? 'Saved' : 'Pending',
    };
  }

  return {
    label: 'Not Marked',
    badgeClass: 'bg-[#EBE2CC] text-[#55594E] border-[#CFC5B1]',
    recordLabel: 'Pending',
  };
};
