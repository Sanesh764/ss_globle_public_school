import React from 'react';
import {
  FiCalendar,
  FiRefreshCw,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiUsers,
  FiBarChart2,
  FiEye,
} from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
import { ATTENDANCE_CLASS_OPTIONS } from '../../utils/adminAttendanceUtils';
import { formatRecordedPercentage } from '../../utils/adminAttendanceReportUtils';

const AttendanceMonthlyReports = ({
  className,
  onClassChange,
  month,
  onMonthChange,
  maxMonth,
  report,
  loading,
  error,
  onRetry,
  onSelectStudent,
}) => {
  const summary = report?.summary || {
    className,
    month,
    totalStudents: 0,
    totalRecordedDays: 0,
    presentCount: 0,
    absentCount: 0,
    markedCount: 0,
    overallRecordedDayPercentage: 0,
  };

  const dailySummary = report?.dailySummary || [];
  const students = report?.students || [];
  const hasSuppliedDailyPct = dailySummary.some(
    (day) => day.attendancePercentage !== null && day.attendancePercentage !== undefined
  );

  return (
    <div className="space-y-6">
      {/* Class & Month Selection Controls */}
      <div className="bg-[#EBE2CC]/55 p-4 sm:p-5 rounded-sm border border-[#CFC5B1] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
        <div>
          <label
            htmlFor="report-class-select"
            className="block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5"
          >
            Class
          </label>
          <select
            id="report-class-select"
            value={className}
            onChange={(e) => onClassChange(e.target.value)}
            disabled={loading}
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
            htmlFor="report-month-input"
            className="block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5"
          >
            Month (IST)
          </label>
          <div className="relative">
            <FiCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-[#34483B] pointer-events-none" />
            <input
              id="report-month-input"
              type="month"
              max={maxMonth}
              value={month}
              onChange={(e) => {
                if (e.target.value) onMonthChange(e.target.value);
              }}
              disabled={loading}
              className="w-full pl-9 pr-3.5 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-sm font-semibold text-[#252821] disabled:opacity-60 focus:outline-none focus:ring-1 focus:ring-[#34483B] focus:border-[#34483B]"
            />
          </div>
        </div>

        <div className="flex sm:col-span-2 lg:col-span-1 lg:justify-end">
          <button
            type="button"
            onClick={onRetry}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-sm border border-[#CFC5B1] bg-white hover:bg-[#F4EFE3] text-[#34483B] text-xs font-semibold disabled:opacity-50 transition-colors"
          >
            <FiRefreshCw className={loading ? 'animate-spin' : ''} />
            <span>Refresh Report</span>
          </button>
        </div>
      </div>

      {/* Monthly Summary Cards */}
      <section
        aria-label="Monthly attendance summary"
        className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4"
      >
        <div className="bg-white border border-emerald-200 rounded-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-emerald-800">
            <span>Total Present</span>
            <FiCheckCircle className="text-emerald-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-emerald-800">
            {summary.presentCount}
          </p>
        </div>

        <div className="bg-white border border-rose-200 rounded-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-rose-800">
            <span>Total Absent</span>
            <FiXCircle className="text-rose-600" />
          </div>
          <p className="text-2xl font-bold font-serif text-rose-800">
            {summary.absentCount}
          </p>
        </div>

        <div className="bg-white border border-[#CFC5B1] rounded-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#55594E]">
            <span>Total Marked</span>
            <FiUsers className="text-[#34483B]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#34483B]">
            {summary.markedCount}
          </p>
        </div>

        <div className="bg-white border border-[#CFC5B1] rounded-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#55594E]">
            <span>Recorded Days</span>
            <FiClock className="text-[#AD8746]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#252821]">
            {summary.totalRecordedDays}
          </p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white border border-[#CFC5B1] rounded-sm p-4 space-y-1">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#34483B]">
            <span>Recorded-Day %</span>
            <FiBarChart2 className="text-[#34483B]" />
          </div>
          <p className="text-2xl font-bold font-serif text-[#34483B]">
            {formatRecordedPercentage(summary.overallRecordedDayPercentage)}
          </p>
          <p className="text-[11px] text-[#55594E]">
            Based on recorded attendance days
          </p>
        </div>
      </section>

      {/* Loading / Error / Report Tables */}
      {loading ? (
        <div className="bg-white border border-[#CFC5B1] rounded-sm py-12">
          <LoadingSpinner text={`Loading ${className} monthly report for ${month}...`} />
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
              Unable to Load Monthly Report
            </h3>
            <p className="text-sm text-[#55594E] max-w-md mx-auto">{error}</p>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold tracking-wide transition-colors"
          >
            <FiRefreshCw />
            <span>Retry</span>
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Daily Attendance Summary Table */}
          <section
            aria-label="Daily attendance summary"
            className="bg-white border border-[#CFC5B1] rounded-sm shadow-xs overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-[#EBE2CC]/35 border-b border-[#CFC5B1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h3 className="text-sm font-bold font-serif text-[#34483B]">
                Daily Attendance Summary ({className} • {month})
              </h3>
              <span className="text-xs text-[#55594E]">
                {dailySummary.length} recorded day(s)
              </span>
            </div>

            {dailySummary.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#55594E]">
                No daily attendance has been recorded for {className} in {month}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#252821]">
                  <thead className="bg-[#EBE2CC]/60 text-[#34483B] font-serif font-bold border-b border-[#CFC5B1] uppercase text-xs">
                    <tr>
                      <th className="py-3 px-5 whitespace-nowrap">Date (IST)</th>
                      <th className="py-3 px-5 whitespace-nowrap">Present</th>
                      <th className="py-3 px-5 whitespace-nowrap">Absent</th>
                      <th className="py-3 px-5 whitespace-nowrap">Total Marked</th>
                      {hasSuppliedDailyPct && (
                        <th className="py-3 px-5 whitespace-nowrap">Attendance %</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CFC5B1]/50">
                    {dailySummary.map((day) => (
                      <tr
                        key={day.attendanceDate}
                        className="hover:bg-[#F4EFE3]/60 transition-colors"
                      >
                        <td className="py-3 px-5 font-mono text-xs sm:text-sm font-semibold text-[#34483B] whitespace-nowrap">
                          {day.attendanceDate}
                        </td>
                        <td className="py-3 px-5 font-semibold text-emerald-800 whitespace-nowrap">
                          {day.presentCount}
                        </td>
                        <td className="py-3 px-5 font-semibold text-rose-800 whitespace-nowrap">
                          {day.absentCount}
                        </td>
                        <td className="py-3 px-5 font-semibold text-[#252821] whitespace-nowrap">
                          {day.markedCount}
                        </td>
                        {hasSuppliedDailyPct && (
                          <td className="py-3 px-5 font-semibold text-[#34483B] whitespace-nowrap">
                            {day.attendancePercentage !== null
                              ? formatRecordedPercentage(day.attendancePercentage)
                              : '—'}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Student-Wise Monthly Summary Table */}
          <section
            aria-label="Student-wise monthly summary"
            className="bg-white border border-[#CFC5B1] rounded-sm shadow-xs overflow-hidden"
          >
            <div className="px-5 py-3.5 bg-[#EBE2CC]/35 border-b border-[#CFC5B1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
              <h3 className="text-sm font-bold font-serif text-[#34483B]">
                Student-Wise Attendance Summary
              </h3>
              <span className="text-xs text-[#55594E]">
                {students.length} student(s)
              </span>
            </div>

            {students.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#55594E]">
                No students or attendance records found for {className} in {month}.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#252821]">
                  <thead className="bg-[#EBE2CC]/60 text-[#34483B] font-serif font-bold border-b border-[#CFC5B1] uppercase text-xs">
                    <tr>
                      <th className="py-3 px-5 whitespace-nowrap">Student</th>
                      <th className="py-3 px-5 whitespace-nowrap">Admission Number</th>
                      <th className="py-3 px-5 whitespace-nowrap">Class</th>
                      <th className="py-3 px-5 whitespace-nowrap">Status</th>
                      <th className="py-3 px-5 whitespace-nowrap">Present</th>
                      <th className="py-3 px-5 whitespace-nowrap">Absent</th>
                      <th className="py-3 px-5 whitespace-nowrap">Recorded Days</th>
                      <th className="py-3 px-5 whitespace-nowrap">Attendance %</th>
                      <th className="py-3 px-5 whitespace-nowrap">History</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CFC5B1]/50">
                    {students.map((stu) => {
                      const displayClass =
                        stu.attendanceClassName || stu.currentClassName || className;

                      return (
                        <tr
                          key={stu.studentId}
                          className="hover:bg-[#F4EFE3]/60 transition-colors"
                        >
                          <td className="py-3 px-5 font-semibold text-[#252821] whitespace-nowrap">
                            {stu.fullName}
                          </td>
                          <td className="py-3 px-5 font-mono text-xs sm:text-sm whitespace-nowrap">
                            {stu.admissionNumber ? (
                              <span className="font-semibold text-[#34483B]">
                                {stu.admissionNumber}
                              </span>
                            ) : (
                              <span className="text-[#55594E] italic font-sans">
                                Not assigned
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-5 text-xs sm:text-sm text-[#34483B] font-medium whitespace-nowrap">
                            <span>{displayClass}</span>
                            {stu.attendanceClassName &&
                              stu.currentClassName &&
                              stu.attendanceClassName !== stu.currentClassName && (
                                <span className="block text-[11px] text-[#55594E]">
                                  Now in {stu.currentClassName}
                                </span>
                              )}
                          </td>
                          <td className="py-3 px-5 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${
                                stu.isActive
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : 'bg-rose-100 text-rose-800 border-rose-300'
                              }`}
                            >
                              {stu.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3 px-5 font-semibold text-emerald-800 whitespace-nowrap">
                            {stu.presentCount}
                          </td>
                          <td className="py-3 px-5 font-semibold text-rose-800 whitespace-nowrap">
                            {stu.absentCount}
                          </td>
                          <td className="py-3 px-5 font-semibold text-[#252821] whitespace-nowrap">
                            {stu.markedDays}
                          </td>
                          <td className="py-3 px-5 font-semibold text-[#34483B] whitespace-nowrap">
                            {formatRecordedPercentage(stu.attendancePercentage)}
                          </td>
                          <td className="py-3 px-5 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onSelectStudent(stu)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#CFC5B1] bg-white hover:bg-[#F4EFE3] text-[#34483B] text-xs font-semibold transition-colors"
                            >
                              <FiEye />
                              <span>View History</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
};

export default AttendanceMonthlyReports;
