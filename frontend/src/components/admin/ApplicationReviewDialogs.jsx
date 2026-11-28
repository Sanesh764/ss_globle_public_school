import React, { useState, useEffect } from 'react';
import {
  FiCheckCircle,
  FiEdit3,
  FiXCircle,
  FiAlertTriangle,
  FiAlertCircle,
  FiX,
} from 'react-icons/fi';
import {
  REVIEW_MESSAGE_MIN_LENGTH,
  REVIEW_MESSAGE_MAX_LENGTH,
  validateCorrectionMessage,
  validateRejectionReason,
} from '../../utils/adminApplicationReviewUtils';

const DIALOG_META = {
  approve: {
    title: 'Approve Student Application',
    headerBg: 'bg-emerald-800',
    icon: FiCheckCircle,
  },
  correction: {
    title: 'Request Application Correction',
    headerBg: 'bg-amber-700',
    icon: FiEdit3,
  },
  reject: {
    title: 'Reject Student Application',
    headerBg: 'bg-rose-800',
    icon: FiXCircle,
  },
};

const ApplicationReviewDialogs = ({
  activeAction,
  application,
  submitting,
  error,
  onClose,
  onConfirmApprove,
  onSubmitCorrection,
  onSubmitReject,
}) => {
  const [message, setMessage] = useState('');
  const [touched, setTouched] = useState(false);
  const [rejectConfirmed, setRejectConfirmed] = useState(false);

  useEffect(() => {
    setMessage('');
    setTouched(false);
    setRejectConfirmed(false);
  }, [activeAction, application?._id]);

  if (!activeAction || !application) return null;

  const meta = DIALOG_META[activeAction];
  if (!meta) return null;

  const Icon = meta.icon;
  const trimmedLength = message.trim().length;
  const validationError =
    activeAction === 'correction'
      ? validateCorrectionMessage(message)
      : activeAction === 'reject'
        ? validateRejectionReason(message)
        : '';

  const isMessageValid = !validationError;
  const canSubmitCorrection = isMessageValid && !submitting;
  const canSubmitReject = isMessageValid && rejectConfirmed && !submitting;

  const handleBackdropClick = (e) => {
    e.stopPropagation();
    if (!submitting) {
      onClose();
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setTouched(true);

    if (activeAction === 'approve') {
      if (!submitting) onConfirmApprove();
      return;
    }

    if (activeAction === 'correction') {
      if (canSubmitCorrection) {
        onSubmitCorrection(message.trim());
      }
      return;
    }

    if (activeAction === 'reject') {
      if (canSubmitReject) {
        onSubmitReject(message.trim());
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-[60] bg-[#252821]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-action-dialog-title"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-[#F4EFE3] rounded-sm max-w-lg w-full border border-[#CFC5B1] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className={`${meta.headerBg} px-5 py-3.5 text-white flex items-center justify-between gap-3`}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Icon className="text-lg shrink-0" />
            <h3
              id="review-action-dialog-title"
              className="font-serif font-bold text-base sm:text-lg truncate"
            >
              {meta.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="p-1 rounded-sm text-white/85 hover:text-white hover:bg-black/15 disabled:opacity-50 transition-colors"
            aria-label="Close review dialog"
          >
            <FiX className="text-lg" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          <div className="bg-white border border-[#CFC5B1] rounded-sm p-3.5 text-xs sm:text-sm space-y-1.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#55594E] font-medium">Application Number</span>
              <span className="font-mono font-bold text-[#34483B]">
                {application.applicationNumber}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[#55594E] font-medium">Student Name</span>
              <span className="font-semibold text-[#252821]">{application.fullName}</span>
            </div>
            {activeAction === 'approve' && (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-[#55594E] font-medium">Class Applying For</span>
                <span className="font-semibold text-[#34483B]">
                  {application.classApplyingFor}
                </span>
              </div>
            )}
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

          {activeAction === 'approve' && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-sm bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs sm:text-sm">
              <FiAlertTriangle className="text-base text-emerald-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Approving this application will create a permanent Student record. Please
                verify the submitted information before continuing.
              </p>
            </div>
          )}

          {activeAction === 'reject' && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-sm bg-rose-50 border border-rose-200 text-rose-950 text-xs sm:text-sm">
              <FiAlertTriangle className="text-base text-rose-700 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Rejecting this application changes its status to <strong>Rejected</strong> and
                locks it from further review. No Student record will be created.
              </p>
            </div>
          )}

          {(activeAction === 'correction' || activeAction === 'reject') && (
            <div className="space-y-1.5">
              <label
                htmlFor="review-action-message"
                className="block text-xs font-semibold uppercase tracking-wider text-[#34483B]"
              >
                {activeAction === 'correction'
                  ? 'Correction Message *'
                  : 'Rejection Reason *'}
              </label>
              <textarea
                id="review-action-message"
                rows={4}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  if (!touched) setTouched(true);
                }}
                onBlur={() => setTouched(true)}
                disabled={submitting}
                maxLength={REVIEW_MESSAGE_MAX_LENGTH}
                placeholder={
                  activeAction === 'correction'
                    ? 'Explain what details need correction (5–500 characters)...'
                    : 'Provide the reason for rejecting this application (5–500 characters)...'
                }
                className="w-full px-3 py-2 rounded-sm border border-[#CFC5B1] bg-white text-sm text-[#252821] focus:outline-none focus:ring-2 focus:ring-[#34483B]/40 disabled:opacity-60 resize-y"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span
                  className={
                    touched && validationError ? 'text-rose-700 font-medium' : 'text-[#55594E]'
                  }
                >
                  {touched && validationError
                    ? validationError
                    : `Required: ${REVIEW_MESSAGE_MIN_LENGTH}–${REVIEW_MESSAGE_MAX_LENGTH} characters`}
                </span>
                <span
                  className={`font-mono ${
                    trimmedLength > REVIEW_MESSAGE_MAX_LENGTH ||
                    (touched && trimmedLength < REVIEW_MESSAGE_MIN_LENGTH)
                      ? 'text-rose-700 font-semibold'
                      : 'text-[#55594E]'
                  }`}
                >
                  {trimmedLength} / {REVIEW_MESSAGE_MAX_LENGTH}
                </span>
              </div>
            </div>
          )}

          {activeAction === 'reject' && (
            <label className="flex items-start gap-2.5 text-xs sm:text-sm text-[#252821] cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rejectConfirmed}
                onChange={(e) => setRejectConfirmed(e.target.checked)}
                disabled={submitting}
                className="mt-0.5 h-4 w-4 rounded-sm border-[#CFC5B1] text-rose-700 focus:ring-rose-600"
              />
              <span>
                I confirm that I want to reject this application and change its status to{' '}
                <strong>Rejected</strong>.
              </span>
            </label>
          )}

          <div className="pt-2 border-t border-[#CFC5B1] flex flex-wrap items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-sm border border-[#CFC5B1] bg-white hover:bg-[#EBE2CC] text-[#34483B] text-xs font-semibold disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>

            {activeAction === 'approve' && (
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                <FiCheckCircle />
                <span>{submitting ? 'Approving...' : 'Confirm Approval'}</span>
              </button>
            )}

            {activeAction === 'correction' && (
              <button
                type="submit"
                disabled={!canSubmitCorrection}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiEdit3 />
                <span>{submitting ? 'Submitting...' : 'Submit Correction Request'}</span>
              </button>
            )}

            {activeAction === 'reject' && (
              <button
                type="submit"
                disabled={!canSubmitReject}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <FiXCircle />
                <span>{submitting ? 'Rejecting...' : 'Confirm Rejection'}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationReviewDialogs;
