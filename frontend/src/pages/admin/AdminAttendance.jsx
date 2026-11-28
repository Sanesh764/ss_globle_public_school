import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  FiCalendar,
  FiAlertCircle,
  FiAlertTriangle,
  FiRefreshCw,
  FiUsers,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiSave,
} from 'react-icons/fi';
import AdminHeader from '../../components/admin/AdminHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AttendanceMonthlyReports from '../../components/admin/AttendanceMonthlyReports';
import StudentAttendanceHistoryModal from '../../components/admin/StudentAttendanceHistoryModal';
import {
  getDailyAttendanceSheet,
  submitBulkAttendance,
  getMonthlyAttendanceSummary,
  getStudentAttendanceHistory,
} from '../../services/adminAttendanceService';
import {
  ATTENDANCE_CLASS_OPTIONS,
  getTodayIndiaDateKey,
  isValidAttendanceDate,
} from '../../utils/adminAttendanceUtils';
import {
  DEFAULT_ATTENDANCE_CLASS,
  normalizeAttendanceSheetResponse,
  getAttendanceSheetErrorMessage,
  getAttendanceStatusBadgeMeta,
} from '../../utils/adminAttendanceSheetUtils';
import {
  isAttendanceRowEligible,
  initializeDraftAttendance,
  updateDraftAttendanceEntry,
  applyBulkDraftStatus,
  countQuickMarkOverwrites,
  hasUnsavedAttendanceChanges,
  computeDraftAttendanceSummary,
  getRowDraftIndicator,
} from '../../utils/adminAttendanceMarkingUtils';
import {
  getUnmarkedActiveStudents,
  getUnresolvedActiveRosterRows,
  buildBulkAttendanceSubmission,
  getAttendanceSaveErrorMessage,
  getAttendanceSaveSuccessMessage,
} from '../../utils/adminAttendanceSubmissionUtils';
import {
  DEFAULT_REPORT_CLASS,
  getCurrentIndiaMonthKey,
  validateMonthlyReportQuery,
  validateStudentHistoryQuery,
  normalizeMonthlySummaryResponse,
  normalizeStudentHistoryResponse,
  getMonthlyReportErrorMessage,
  getStudentHistoryErrorMessage,
} from '../../utils/adminAttendanceReportUtils';

const AdminAttendance = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});

  const todayIndiaDate = getTodayIndiaDateKey();
  const currentIndiaMonth = getCurrentIndiaMonthKey();

  const [activeTab, setActiveTab] = useState('daily');

  const [className, setClassName] = useState(DEFAULT_ATTENDANCE_CLASS);
  const [attendanceDate, setAttendanceDate] = useState(todayIndiaDate);
  const [sheet, setSheet] = useState(null);
  const [draftAttendance, setDraftAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  const [reportClassName, setReportClassName] = useState(DEFAULT_REPORT_CLASS);
  const [reportMonth, setReportMonth] = useState(currentIndiaMonth);
  const [monthlyReport, setMonthlyReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState('');

  const [selectedHistoryStudent, setSelectedHistoryStudent] = useState(null);
  const [studentHistory, setStudentHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState('');

  const requestIdRef = useRef(0);
  const savingRef = useRef(false);
  const reportRequestIdRef = useRef(0);
  const historyRequestIdRef = useRef(0);

  const fetchSheet = useCallback(
    async ({ preserveMessages = false } = {}) => {
      const currentRequestId = ++requestIdRef.current;

      if (!preserveMessages) {
        setSaveError('');
        setSaveSuccess('');
      }

      if (!isValidAttendanceDate(attendanceDate)) {
        setLoading(false);
        setSheet(null);
        setDraftAttendance({});
        setError('Please select a valid non-future attendance date (YYYY-MM-DD).');
        return false;
      }

      try {
        setLoading(true);
        setError('');
        setSheet(null);
        setDraftAttendance({});

        const res = await getDailyAttendanceSheet({
          className,
          date: attendanceDate,
        });

        if (currentRequestId !== requestIdRef.current) return false;

        const normalized = normalizeAttendanceSheetResponse(res);
        if (!normalized) {
          setError('Daily attendance sheet could not be loaded.');
          return false;
        }

        setSheet(normalized);
        setDraftAttendance(initializeDraftAttendance(normalized.students));
        return true;
      } catch (err) {
        if (currentRequestId !== requestIdRef.current) return false;
        setError(getAttendanceSheetErrorMessage(err));
        return false;
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [className, attendanceDate]
  );

  useEffect(() => {
    fetchSheet();
  }, [fetchSheet]);

  const fetchMonthlyReport = useCallback(async () => {
    const currentRequestId = ++reportRequestIdRef.current;
    const validationError = validateMonthlyReportQuery({
      className: reportClassName,
      month: reportMonth,
    });

    if (validationError) {
      setReportLoading(false);
      setMonthlyReport(null);
      setReportError(validationError);
      return;
    }

    try {
      setReportLoading(true);
      setReportError('');
      setMonthlyReport(null);

      const res = await getMonthlyAttendanceSummary({
        className: reportClassName,
        month: reportMonth,
      });

      if (currentRequestId !== reportRequestIdRef.current) return;

      const normalized = normalizeMonthlySummaryResponse(res);
      if (!normalized) {
        setReportError('Monthly attendance report could not be loaded.');
        return;
      }

      setMonthlyReport(normalized);
    } catch (err) {
      if (currentRequestId !== reportRequestIdRef.current) return;
      setReportError(getMonthlyReportErrorMessage(err));
    } finally {
      if (currentRequestId === reportRequestIdRef.current) {
        setReportLoading(false);
      }
    }
  }, [reportClassName, reportMonth]);

  useEffect(() => {
    if (activeTab === 'monthly') {
      fetchMonthlyReport();
    }
  }, [activeTab, fetchMonthlyReport]);

  const fetchStudentHistory = useCallback(
    async (studentRow) => {
      if (!studentRow?.studentId) return;
      const currentRequestId = ++historyRequestIdRef.current;

      setSelectedHistoryStudent(studentRow);
      setStudentHistory(null);

      const validationError = validateStudentHistoryQuery(
        studentRow.studentId,
        reportMonth
      );
      if (validationError) {
        setHistoryLoading(false);
        setHistoryError(validationError);
        return;
      }

      try {
        setHistoryLoading(true);
        setHistoryError('');

        const res = await getStudentAttendanceHistory(
          studentRow.studentId,
          reportMonth
        );

        if (currentRequestId !== historyRequestIdRef.current) return;

        const normalized = normalizeStudentHistoryResponse(res);
        if (!normalized) {
          setHistoryError('Student attendance history could not be loaded.');
          return;
        }

        setStudentHistory(normalized);
      } catch (err) {
        if (currentRequestId !== historyRequestIdRef.current) return;
        setHistoryError(getStudentHistoryErrorMessage(err));
      } finally {
        if (currentRequestId === historyRequestIdRef.current) {
          setHistoryLoading(false);
        }
      }
    },
    [reportMonth]
  );

  const handleCloseHistoryModal = () => {
    historyRequestIdRef.current += 1;
    setSelectedHistoryStudent(null);
    setStudentHistory(null);
    setHistoryError('');
    setHistoryLoading(false);
  };

  const students = sheet?.students || [];
  const draftSummary = computeDraftAttendanceSummary(students, draftAttendance);
  const hasUnsavedChanges = hasUnsavedAttendanceChanges(students, draftAttendance);
  const unmarkedActiveStudents = getUnmarkedActiveStudents(
    students,
    draftAttendance,
    className
  );
  const unmarkedActiveCount = unmarkedActiveStudents.length;
  const unresolvedActiveRows = getUnresolvedActiveRosterRows(students, className);
  const unresolvedActiveCount = unresolvedActiveRows.length;
  const conflictCount =
    sheet?.summary?.crossClassConflictCount ?? draftSummary.conflictCount;

  useEffect(() => {
    if (!hasUnsavedChanges && !saving) return undefined;

    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges, saving]);

  const confirmDiscardUnsavedChanges = () => {
    if (!hasUnsavedChanges) return true;
    return window.confirm(
      'You have unsaved attendance changes. Discard unsaved changes and continue?'
    );
  };

  const handleClassChange = (e) => {
    if (saving || savingRef.current) return;
    const nextClass = e.target.value;
    if (nextClass === className) return;
    if (!confirmDiscardUnsavedChanges()) return;
    setClassName(nextClass);
  };

  const handleDateChange = (e) => {
    if (saving || savingRef.current) return;
    const nextDate = e.target.value;
    if (!nextDate || nextDate === attendanceDate) return;
    if (!confirmDiscardUnsavedChanges()) return;
    setAttendanceDate(nextDate);
  };

  const handleRefreshSheet = () => {
    if (saving || savingRef.current) return;
    if (!confirmDiscardUnsavedChanges()) return;
    fetchSheet();
  };

  const handleMarkStudent = (studentId, status) => {
    if (saving || savingRef.current) return;
    setSaveError('');
    setSaveSuccess('');
    setDraftAttendance((prev) =>
      updateDraftAttendanceEntry(prev, studentId, status, students)
    );
  };

  const handleMarkAll = (targetStatus) => {
    if (saving || savingRef.current) return;
    if (draftSummary.eligibleCount === 0) return;

    const overwriteCount = countQuickMarkOverwrites(
      students,
      draftAttendance,
      targetStatus
    );

    if (overwriteCount > 0) {
      const confirmed = window.confirm(
        `Overwrite ${overwriteCount} existing attendance selection(s) with ${targetStatus}?`
      );
      if (!confirmed) return;
    }

    setSaveError('');
    setSaveSuccess('');
    setDraftAttendance((prev) =>
      applyBulkDraftStatus(students, prev, targetStatus)
    );
  };

  const handleSaveAttendance = async () => {
    if (savingRef.current || loading || !hasUnsavedChanges) return;

    setSaveError('');
    setSaveSuccess('');

    let submission;
    try {
      submission = buildBulkAttendanceSubmission({
        className,
        attendanceDate,
        students,
        draftAttendance,
      });
    } catch (validationErr) {
      setSaveError(validationErr.message);
      return;
    }

    savingRef.current = true;
    setSaving(true);

    try {
      const res = await submitBulkAttendance(submission.payload);
      await fetchSheet({ preserveMessages: true });
      setSaveSuccess(getAttendanceSaveSuccessMessage(res));
    } catch (err) {
      setSaveError(getAttendanceSaveErrorMessage(err));
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminHeader setMobileOpen={setMobileOpen} title="Student Attendance" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Page Subtitle, Context & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-[#CFC5B1] pb-4">
          <div className="space-y-1">
            <p className="text-sm text-[#55594E]">
              {activeTab === 'daily'
                ? 'Manage daily attendance for Class 8 and Class 9.'
                : 'View monthly attendance summaries and student history for Class 8 and Class 9.'}
            </p>
            <span className="inline-block text-xs font-semibold text-[#34483B] bg-[#EBE2CC] border border-[#CFC5B1] px-3 py-1 rounded-sm">
              {activeTab === 'daily'
                ? `${className} • ${attendanceDate} (IST)`
                : `${reportClassName} • ${reportMonth} (IST)`}
            </span>
          </div>

          <div
            role="tablist"
            aria-label="Attendance views"
            className="inline-flex rounded-sm border border-[#CFC5B1] bg-[#EBE2CC]/60 p-1 self-start sm:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'daily'}
              disabled={saving}
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors disabled:opacity-60 ${
                activeTab === 'daily'
                  ? 'bg-[#34483B] text-[#F4EFE3]'
                  : 'text-[#34483B] hover:bg-white/70'
              }`}
            >
              Daily Attendance
              {hasUnsavedChanges && (
                <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-amber-400 align-middle" />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'monthly'}
              disabled={saving}
              onClick={() => setActiveTab('monthly')}
              className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold transition-colors disabled:opacity-60 ${
                activeTab === 'monthly'
                  ? 'bg-[#34483B] text-[#F4EFE3]'
                  : 'text-[#34483B] hover:bg-white/70'
              }`}
            >
              Monthly Reports
            </button>
          </div>
        </div>

        {activeTab === 'monthly' ? (
          <>
            <AttendanceMonthlyReports
              className={reportClassName}
              onClassChange={setReportClassName}
              month={reportMonth}
              onMonthChange={setReportMonth}
              maxMonth={currentIndiaMonth}
              report={monthlyReport}
              loading={reportLoading}
              error={reportError}
              onRetry={fetchMonthlyReport}
              onSelectStudent={fetchStudentHistory}
            />
            <StudentAttendanceHistoryModal
              isOpen={Boolean(selectedHistoryStudent)}
              studentSummary={selectedHistoryStudent}
              month={reportMonth}
              historyData={studentHistory}
              loading={historyLoading}
              error={historyError}
              onRetry={() => fetchStudentHistory(selectedHistoryStudent)}
              onClose={handleCloseHistoryModal}
            />
          </>
        ) : (
          <>

        {/* Class & Date Selection Controls */}
        <div className="bg-[#EBE2CC]/55 p-4 sm:p-5 rounded-sm border border-[#CFC5B1] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
          <div>
            <label
              htmlFor="attendance-class-select"
              className="block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5"
            >
              Class
            </label>
            <select
              id="attendance-class-select"
              value={className}
              onChange={handleClassChange}
              disabled={loading || saving}
              className="w-full px-3.5 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-sm font-semibold text-[#252821] disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-[#34483B] focus:border-[#34483B]"
            >
              {ATTENDANCE_CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="attendance-date-input"
              className="block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5"
            >
              Attendance Date (IST)
            </label>
            <div className="relative">
              <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#34483B] pointer-events-none" />
              <input
                id="attendance-date-input"
                type="date"
                max={todayIndiaDate}
                value={attendanceDate}
                onChange={handleDateChange}
                disabled={loading || saving}
                className="w-full pl-9 pr-3.5 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-sm font-semibold text-[#252821] disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-[#34483B] focus:border-[#34483B]"
              />
            </div>
          </div>

          <div className="flex flex-wrap sm:col-span-2 lg:col-span-1 lg:justify-end gap-2">
            <button
              type="button"
              onClick={handleRefreshSheet}
              disabled={loading || saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-[#CFC5B1] bg-white hover:bg-[#F4EFE3] text-[#34483B] text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              <span>Refresh Sheet</span>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <section
          aria-label="Attendance summary"
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4"
        >
          <div className="bg-white border border-[#CFC5B1] rounded-sm p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#55594E]">
              <span>Total Students</span>
              <FiUsers className="text-[#34483B]" />
            </div>
            <p className="text-2xl font-bold font-serif text-[#34483B]">
              {draftSummary.totalStudents}
            </p>
          </div>

          <div className="bg-white border border-emerald-200 rounded-sm p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-800">
              <span>Present</span>
              <FiCheckCircle className="text-emerald-600" />
            </div>
            <p className="text-2xl font-bold font-serif text-emerald-800">
              {draftSummary.presentCount}
            </p>
          </div>

          <div className="bg-white border border-rose-200 rounded-sm p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-rose-800">
              <span>Absent</span>
              <FiXCircle className="text-rose-600" />
            </div>
            <p className="text-2xl font-bold font-serif text-rose-800">
              {draftSummary.absentCount}
            </p>
          </div>

          <div className="bg-white border border-[#CFC5B1] rounded-sm p-4 space-y-1">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#55594E]">
              <span>Unmarked</span>
              <FiClock className="text-[#AD8746]" />
            </div>
            <p className="text-2xl font-bold font-serif text-[#252821]">
              {draftSummary.unmarkedCount}
            </p>
          </div>
        </section>

        {/* Save Success Banner */}
        {saveSuccess && (
          <div
            role="status"
            className="flex items-start gap-3 p-4 rounded-sm bg-emerald-50 border border-emerald-300 text-emerald-950 text-xs sm:text-sm"
          >
            <FiCheckCircle className="text-lg text-emerald-700 shrink-0 mt-0.5" />
            <p className="font-semibold">{saveSuccess}</p>
          </div>
        )}

        {/* Save Error Banner */}
        {saveError && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-sm bg-rose-50 border border-rose-300 text-rose-950 text-xs sm:text-sm"
          >
            <FiAlertCircle className="text-lg text-rose-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">Unable to Save Attendance</p>
              <p className="text-rose-900">{saveError}</p>
            </div>
          </div>
        )}

        {/* Unsaved Draft Notice Banner */}
        {!loading && !error && hasUnsavedChanges && (
          <div
            role="status"
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 rounded-sm bg-[#FFF8E6] border border-[#E8D28C] text-[#7A5600] text-xs sm:text-sm"
          >
            <div className="flex items-start gap-3">
              <FiAlertCircle className="text-lg text-[#946200] shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Attendance changes are not saved yet.</p>
                <p className="text-xs text-[#7A5600]/90">
                  {draftSummary.pendingCount > 0 && (
                    <span>{draftSummary.pendingCount} pending mark(s)</span>
                  )}
                  {draftSummary.pendingCount > 0 && draftSummary.modifiedCount > 0 && (
                    <span> • </span>
                  )}
                  {draftSummary.modifiedCount > 0 && (
                    <span>{draftSummary.modifiedCount} modified record(s)</span>
                  )}
                  {unmarkedActiveCount > 0 && (
                    <span>
                      {(draftSummary.pendingCount > 0 || draftSummary.modifiedCount > 0) &&
                        ' • '}
                      <strong>{unmarkedActiveCount} active student(s) remain unmarked</strong>
                    </span>
                  )}
                </p>
              </div>
            </div>
            <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-sm bg-white/80 border border-[#E8D28C] self-start sm:self-auto">
              Draft Mode
            </span>
          </div>
        )}

        {/* Cross-Class Conflict Warning Banner */}
        {!loading && !error && conflictCount > 0 && (
          <div
            role="alert"
            className="flex items-start gap-3 p-4 rounded-sm bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm"
          >
            <FiAlertTriangle className="text-lg text-amber-700 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-bold">
                Cross-Class Attendance Conflict Detected ({conflictCount})
              </p>
              <p className="text-amber-900">
                Highlighted student(s) already have an attendance record in another class for{' '}
                <strong>{attendanceDate}</strong> and cannot be marked a second time on the
                same date.
              </p>
            </div>
          </div>
        )}

        {/* Content Area: Loading / Error / Empty / Table */}
        {loading ? (
          <div className="bg-white border border-[#CFC5B1] rounded-sm py-12">
            <LoadingSpinner text={`Loading ${className} attendance sheet...`} />
          </div>
        ) : error ? (
          <div
            role="alert"
            className="bg-white border border-rose-300 rounded-sm p-8 text-center space-y-4"
          >
            <div className="w-12 h-12 mx-auto rounded-sm bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center text-xl">
              <FiAlertCircle />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold font-serif text-[#252821]">
                Unable to Load Attendance Sheet
              </h3>
              <p className="text-sm text-[#55594E] max-w-md mx-auto">{error}</p>
            </div>
            <button
              type="button"
              onClick={fetchSheet}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold tracking-wide transition-colors"
            >
              <FiRefreshCw />
              <span>Retry</span>
            </button>
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white border border-[#CFC5B1] rounded-sm p-10 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-sm bg-[#EBE2CC] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center text-xl">
              <FiUsers />
            </div>
            <h3 className="text-base font-bold font-serif text-[#34483B]">
              No Students Found for {className}
            </h3>
            <p className="text-sm text-[#55594E] max-w-md mx-auto">
              There are no active students in {className} and no saved attendance records for{' '}
              {attendanceDate}.
            </p>
          </div>
        ) : (
          <div className="bg-white border border-[#CFC5B1] rounded-sm shadow-xs overflow-hidden">
            {/* Quick-Mark & Save Toolbar */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 px-5 py-3.5 bg-[#EBE2CC]/35 border-b border-[#CFC5B1]">
              <div className="space-y-0.5">
                <p className="text-xs text-[#55594E]">
                  Showing{' '}
                  <strong className="text-[#34483B]">{draftSummary.eligibleCount}</strong>{' '}
                  markable student(s)
                  {draftSummary.totalStudents > draftSummary.eligibleCount && (
                    <span>
                      {' '}
                      ({draftSummary.totalStudents - draftSummary.eligibleCount} locked)
                    </span>
                  )}
                </p>
                {unresolvedActiveCount > 0 && (
                  <p className="text-xs font-semibold text-amber-900">
                    Attendance roster contains {unresolvedActiveCount} unresolved active student
                    record(s):{' '}
                    {unresolvedActiveRows
                      .slice(0, 3)
                      .map((r) => r.fullName || r.studentId)
                      .join(', ')}
                    {unresolvedActiveCount > 3 ? ` and ${unresolvedActiveCount - 3} more` : ''}.
                    Resolve the issue and refresh the sheet before saving.
                  </p>
                )}
                {unmarkedActiveCount > 0 && (
                  <p className="text-xs font-semibold text-amber-800">
                    {unmarkedActiveCount} active student(s) remain unmarked. Mark all active
                    students as Present or Absent to save.
                  </p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkAll('Present')}
                  disabled={loading || saving || draftSummary.eligibleCount === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  <FiCheckCircle />
                  <span>Mark All Present</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleMarkAll('Absent')}
                  disabled={loading || saving || draftSummary.eligibleCount === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  <FiXCircle />
                  <span>Mark All Absent</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveAttendance}
                  disabled={
                    loading ||
                    saving ||
                    !hasUnsavedChanges ||
                    unmarkedActiveCount > 0 ||
                    unresolvedActiveCount > 0 ||
                    students.length === 0
                  }
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  {saving ? (
                    <>
                      <FiRefreshCw className="animate-spin" />
                      <span>Saving attendance...</span>
                    </>
                  ) : (
                    <>
                      <FiSave />
                      <span>Save Attendance</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-[#252821]">
                <thead className="bg-[#EBE2CC]/60 text-[#34483B] font-serif font-bold border-b border-[#CFC5B1] uppercase text-xs">
                  <tr>
                    <th className="py-3.5 px-5 whitespace-nowrap">Student</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Admission Number</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Class</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Student Status</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Attendance</th>
                    <th className="py-3.5 px-5 whitespace-nowrap">Draft Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CFC5B1]/50">
                  {students.map((row) => {
                    const eligible = isAttendanceRowEligible(row);
                    const draftStatus = draftAttendance[row.studentId] || null;
                    const badgeMeta = getAttendanceStatusBadgeMeta(row);
                    const indicator = getRowDraftIndicator(row, draftStatus);
                    const displayClass =
                      row.attendanceClassName || row.currentClassName || className;

                    return (
                      <tr
                        key={row.studentId}
                        className={
                          row.crossClassConflict
                            ? 'bg-amber-50/60 hover:bg-amber-50 transition-colors'
                            : 'hover:bg-[#F4EFE3]/60 transition-colors'
                        }
                      >
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <div className="font-semibold text-[#252821]">
                            {row.fullName}
                            {row.studentUnavailable && (
                              <span className="ml-2 text-[11px] font-normal italic text-[#55594E]">
                                (Student unavailable)
                              </span>
                            )}
                          </div>
                          {row.crossClassConflict && (
                            <p className="text-[11px] text-amber-800 mt-0.5">
                              {row.crossClassConflict.message}
                            </p>
                          )}
                        </td>
                        <td className="py-3.5 px-5 font-mono text-xs sm:text-sm whitespace-nowrap">
                          {row.admissionNumber ? (
                            <span className="font-semibold text-[#34483B]">
                              {row.admissionNumber}
                            </span>
                          ) : (
                            <span className="text-[#55594E] italic font-sans">Not assigned</span>
                          )}
                        </td>
                        <td className="py-3.5 px-5 text-xs sm:text-sm text-[#34483B] font-medium whitespace-nowrap">
                          <span>{displayClass}</span>
                          {row.attendanceClassName &&
                            row.currentClassName &&
                            row.attendanceClassName !== row.currentClassName && (
                              <span className="block text-[11px] text-[#55594E]">
                                Now in {row.currentClassName}
                              </span>
                            )}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${
                              row.isActive
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {row.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          {eligible ? (
                            <div
                              role="group"
                              aria-label={`Attendance for ${row.fullName}`}
                              className="inline-flex rounded-sm border border-[#CFC5B1] overflow-hidden bg-[#F4EFE3]"
                            >
                              <button
                                type="button"
                                aria-label={`Mark ${row.fullName} Present`}
                                aria-pressed={draftStatus === 'Present'}
                                disabled={saving}
                                onClick={() => handleMarkStudent(row.studentId, 'Present')}
                                className={`px-3 py-1.5 text-xs font-semibold disabled:opacity-60 transition-colors ${
                                  draftStatus === 'Present'
                                    ? 'bg-emerald-700 text-white'
                                    : 'bg-white text-[#34483B] hover:bg-emerald-50'
                                }`}
                              >
                                Present
                              </button>
                              <button
                                type="button"
                                aria-label={`Mark ${row.fullName} Absent`}
                                aria-pressed={draftStatus === 'Absent'}
                                disabled={saving}
                                onClick={() => handleMarkStudent(row.studentId, 'Absent')}
                                className={`px-3 py-1.5 text-xs font-semibold border-l border-[#CFC5B1] disabled:opacity-60 transition-colors ${
                                  draftStatus === 'Absent'
                                    ? 'bg-rose-700 text-white'
                                    : 'bg-white text-[#34483B] hover:bg-rose-50'
                                }`}
                              >
                                Absent
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${badgeMeta.badgeClass}`}
                              >
                                {badgeMeta.label}
                              </span>
                              <p className="text-[11px] text-[#55594E]">
                                {row.crossClassConflict
                                  ? 'Locked (other class)'
                                  : row.studentUnavailable
                                  ? 'Student unavailable'
                                  : 'Inactive & unmarked'}
                              </p>
                            </div>
                          )}
                        </td>
                        <td className="py-3.5 px-5 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${indicator.badgeClass}`}
                          >
                            {indicator.label}
                          </span>
                          {eligible && row.isMarked && draftStatus !== row.status && (
                            <span className="block text-[11px] text-[#55594E] mt-0.5">
                              Was: {row.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
          </>
        )}
      </main>
    </div>
  );
};

export default AdminAttendance;
