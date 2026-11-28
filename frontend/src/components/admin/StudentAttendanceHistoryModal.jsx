import React, { useEffect } from 'react';
import { FiX, FiRefreshCw, FiAlertCircle, FiArrowLeft, FiCalendar } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
import { formatRecordedPercentage } from '../../utils/adminAttendanceReportUtils';

const StudentAttendanceHistoryModal = ({
  isOpen,
  studentSummary,
  month,
  historyData,
  loading,
  error,
  onRetry,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const student = historyData?.student || studentSummary || {};
  const history = historyData?.history || [];
  const summary = historyData?.summary || {
    presentCount: studentSummary?.presentCount || 0,
    absentCount: studentSummary?.absentCount || 0,
    markedDays: studentSummary?.markedDays || 0,
    attendancePercentage: studentSummary?.attendancePercentage || 0,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-history-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
    >
      <div className="bg-[#FAF7F0] border border-[#CFC5B1] rounded-sm shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-5 py-4 bg-[#EBE2CC] border-b border-[#CFC5B1]">
          <div className="space-y-1">
            <h2
              id="student-history-modal-title"
              className="text-lg font-bold font-serif text-[#34483B]"
            >
              {student.fullName || 'Student Attendance History'}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-[#55594E]">
              {student.admissionNumber && (
                <span className="font-mono font-semibold text-[#34483B]">
                  {student.admissionNumber}
                </span>
              )}
              {student.currentClassName && (
                <span>• Current Class: {student.currentClassName}</span>
              )}
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[10px] font-bold uppercase tracking-wider ${
                  student.isActive
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {student.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="inline-flex items-center gap-1 font-semibold text-[#34483B]">
                <FiCalendar />
                <span>{month}</span>
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close student history"
            className="p-1.5 rounded-sm text-[#34483B] hover:bg-[#CFC5B1]/40 transition-colors"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {/* Student Monthly Summary Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-emerald-200 rounded-sm p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800">
                Present
              </p>
              <p className="text-xl font-bold font-serif text-emerald-800">
                {summary.presentCount}
              </p>
            </div>
            <div className="bg-white border border-rose-200 rounded-sm p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-rose-800">
                Absent
              </p>
              <p className="text-xl font-bold font-serif text-rose-800">
                {summary.absentCount}
              </p>
            </div>
            <div className="bg-white border border-[#CFC5B1] rounded-sm p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                Recorded Days
              </p>
              <p className="text-xl font-bold font-serif text-[#252821]">
                {summary.markedDays}
              </p>
            </div>
            <div className="bg-white border border-[#CFC5B1] rounded-sm p-3">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[#34483B]">
                Recorded-Day %
              </p>
              <p className="text-xl font-bold font-serif text-[#34483B]">
                {formatRecordedPercentage(summary.attendancePercentage)}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white border border-[#CFC5B1] rounded-sm py-10">
              <LoadingSpinner text={`Loading attendance history for ${month}...`} />
            </div>
          ) : error ? (
            <div
              role="alert"
              className="bg-white border border-rose-300 rounded-sm p-6 text-center space-y-3"
            >
              <FiAlertCircle className="text-2xl text-rose-700 mx-auto" />
              <p className="text-sm text-[#252821] font-semibold">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold transition-colors"
              >
                <FiRefreshCw />
                <span>Retry</span>
              </button>
            </div>
          ) : history.length === 0 ? (
            <div className="bg-white border border-[#CFC5B1] rounded-sm p-8 text-center text-sm text-[#55594E]">
              No attendance records found for this student in {month}.
            </div>
          ) : (
            <div className="bg-white border border-[#CFC5B1] rounded-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-[#252821]">
                  <thead className="bg-[#EBE2CC]/60 text-[#34483B] font-serif font-bold border-b border-[#CFC5B1] uppercase text-xs">
                    <tr>
                      <th className="py-3 px-4 whitespace-nowrap">Date (IST)</th>
                      <th className="py-3 px-4 whitespace-nowrap">Status</th>
                      <th className="py-3 px-4 whitespace-nowrap">Recorded Class</th>
                      <th className="py-3 px-4 whitespace-nowrap">Marked By</th>
                      <th className="py-3 px-4 whitespace-nowrap">Updated By</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CFC5B1]/50">
                    {history.map((item) => (
                      <tr
                        key={item._id}
                        className="hover:bg-[#F4EFE3]/60 transition-colors"
                      >
                        <td className="py-3 px-4 font-mono text-xs sm:text-sm font-semibold text-[#34483B] whitespace-nowrap">
                          {item.attendanceDate}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${
                              item.status === 'Present'
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-rose-100 text-rose-800 border-rose-300'
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-xs sm:text-sm font-medium text-[#34483B] whitespace-nowrap">
                          {item.className}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#55594E] whitespace-nowrap">
                          {item.markedBy?.name || '—'}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#55594E] whitespace-nowrap">
                          {item.updatedBy?.name || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#EBE2CC]/45 border-t border-[#CFC5B1] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-sm border border-[#CFC5B1] bg-white hover:bg-[#F4EFE3] text-[#34483B] text-xs font-semibold transition-colors"
          >
            <FiArrowLeft />
            <span>Back to Monthly Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentAttendanceHistoryModal;
