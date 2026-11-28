import React from 'react';
import {
  FiCheckCircle,
  FiUserX,
  FiAlertTriangle,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';
import { getStudentStatusActionConfig } from '../../utils/adminStudentStatusUtils';

const StudentStatusConfirmDialog = ({
  isOpen,
  student,
  submitting,
  error,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen || !student) return null;

  const config = getStudentStatusActionConfig(student.isActive);
  if (!config) return null;

  const isDeactivating = config.actionType === 'deactivate';
  const HeaderIcon = isDeactivating ? FiUserX : FiCheckCircle;

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    if (!submitting) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#252821]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-status-confirm-title"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[#F4EFE3] rounded-sm max-w-lg w-full border border-[#CFC5B1] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${
            isDeactivating ? 'bg-rose-800' : 'bg-emerald-800'
          } px-5 py-3.5 text-white flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <HeaderIcon className="text-lg shrink-0" />
            <h3
              id="student-status-confirm-title"
              className="font-serif font-bold text-base sm:text-lg truncate"
            >
              {config.dialogTitle}
            </h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="p-1 rounded-sm text-white/85 hover:text-white hover:bg-black/15 disabled:opacity-50 transition-colors"
            aria-label="Close status confirmation dialog"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="bg-white border border-[#CFC5B1] rounded-sm p-3.5 text-xs sm:text-sm space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#55594E] font-medium">Student Name</span>
              <span className="font-semibold text-[#252821]">{student.fullName}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#55594E] font-medium">Class</span>
              <span className="font-semibold text-[#34483B]">{student.className}</span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#55594E] font-medium">Current Status</span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${
                  student.isActive
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {student.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2.5 p-3 rounded-sm bg-rose-50 border border-rose-300 text-rose-800 text-xs sm:text-sm"
            >
              <FiAlertCircle className="text-base shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div
            className={`flex items-start gap-2.5 p-3.5 rounded-sm border text-xs sm:text-sm ${
              isDeactivating
                ? 'bg-rose-50 border-rose-200 text-rose-950'
                : 'bg-emerald-50 border-emerald-200 text-emerald-950'
            }`}
          >
            <FiAlertTriangle
              className={`text-base shrink-0 mt-0.5 ${
                isDeactivating ? 'text-rose-700' : 'text-emerald-700'
              }`}
            />
            <p className="leading-relaxed">{config.message}</p>
          </div>

          <div className="pt-2 border-t border-[#CFC5B1] flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onCancel}
              disabled={submitting}
              className="px-4 py-2 rounded-sm border border-[#CFC5B1] bg-white hover:bg-[#EBE2CC] text-[#34483B] text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(config.nextIsActive)}
              disabled={submitting}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-sm text-white text-xs font-semibold disabled:opacity-50 transition-colors ${
                isDeactivating
                  ? 'bg-rose-700 hover:bg-rose-800'
                  : 'bg-emerald-700 hover:bg-emerald-800'
              }`}
            >
              <HeaderIcon />
              <span>{submitting ? config.processingLabel : config.confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentStatusConfirmDialog;
