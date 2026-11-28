import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiUser,
  FiClock,
  FiPhone,
  FiMail,
  FiCheckCircle,
  FiEdit2,
  FiEdit3,
  FiXCircle,
  FiLock,
} from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
import ApplicationEditForm from './ApplicationEditForm';
import ApplicationReviewDialogs from './ApplicationReviewDialogs';
import {
  getAdminApplicationById,
  updateAdminApplication,
  approveAdminApplication,
  requestAdminApplicationCorrection,
  rejectAdminApplication,
} from '../../services/adminApplicationService';
import {
  isApplicationEditable,
  buildEditFormValues,
  validateAdminApplicationEdit,
  buildAdminApplicationUpdatePayload,
  hasUnsavedEditChanges,
} from '../../utils/adminApplicationEditUtils';
import {
  canReviewApplication,
  getReviewHistoryActionLabel,
  getReviewErrorDetails,
} from '../../utils/adminApplicationReviewUtils';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { useToast } from '../../hooks/useToast';

const STATUS_BADGE_STYLES = {
  Pending: 'bg-amber-100 text-amber-800 border-amber-300',
  'Correction Requested': 'bg-orange-100 text-orange-800 border-orange-300',
  Approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  Rejected: 'bg-rose-100 text-rose-800 border-rose-300',
};

const ApplicationDetailModal = ({ applicationId, isOpen, onClose, onApplicationUpdated }) => {
  const { addToast } = useToast();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoLoadError, setPhotoLoadError] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(buildEditFormValues());
  const [editErrors, setEditErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const [activeReviewAction, setActiveReviewAction] = useState(null);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  const requestIdRef = useRef(0);
  const reviewSubmittingRef = useRef(false);

  const fetchDetail = useCallback(async () => {
    if (!isOpen || !applicationId) return;

    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError('');
      setApplication(null);
      setPhotoLoadError(false);

      const res = await getAdminApplicationById(applicationId);
      if (currentRequestId !== requestIdRef.current) return;

      const appData = res?.data?.application || null;
      if (!appData) {
        setError('Application details could not be loaded.');
        return;
      }

      setApplication(appData);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      const status = err?.response?.status;
      if (status === 404) {
        setError('Student application was not found.');
      } else if (status === 401 || status === 403) {
        setError('You are not authorized to view this application.');
      } else {
        setError(
          err?.response?.data?.message || 'Failed to load application details. Please try again.'
        );
      }
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [applicationId, isOpen]);

  useEffect(() => {
    if (isOpen && applicationId) {
      setIsEditing(false);
      setEditErrors({});
      setSaveError('');
      setActiveReviewAction(null);
      setReviewError('');
      setReviewSubmitting(false);
      reviewSubmittingRef.current = false;
      fetchDetail();
    } else {
      setApplication(null);
      setError('');
      setPhotoLoadError(false);
      setIsEditing(false);
      setEditErrors({});
      setSaveError('');
      setActiveReviewAction(null);
      setReviewError('');
      setReviewSubmitting(false);
      reviewSubmittingRef.current = false;
    }
  }, [isOpen, applicationId, fetchDetail]);

  const handleRequestClose = useCallback(() => {
    if (saving || reviewSubmitting) return;
    if (activeReviewAction) {
      setActiveReviewAction(null);
      setReviewError('');
      return;
    }
    if (isEditing && hasUnsavedEditChanges(editValues, application)) {
      const confirmed = window.confirm(
        'You have unsaved changes. Discard changes and close?'
      );
      if (!confirmed) return;
    }
    setIsEditing(false);
    onClose();
  }, [saving, reviewSubmitting, activeReviewAction, isEditing, editValues, application, onClose]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (activeReviewAction) {
          if (!reviewSubmitting) {
            setActiveReviewAction(null);
            setReviewError('');
          }
          return;
        }
        handleRequestClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activeReviewAction, reviewSubmitting, handleRequestClose]);

  const handleStartEdit = () => {
    if (
      !application ||
      reviewSubmitting ||
      activeReviewAction ||
      !isApplicationEditable(application.status)
    ) {
      return;
    }
    setEditValues(buildEditFormValues(application));
    setEditErrors({});
    setSaveError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setEditErrors({});
    setSaveError('');
    setIsEditing(false);
  };

  const handleEditFieldChange = (e) => {
    const { name, value } = e.target;
    setEditValues((prev) => ({ ...prev, [name]: value }));
    setEditErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (saveError) setSaveError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (saving || !application) return;

    setSaveError('');
    const validationErrors = validateAdminApplicationEdit(editValues);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    try {
      setSaving(true);
      const payload = buildAdminApplicationUpdatePayload(editValues);
      const res = await updateAdminApplication(application._id, payload);
      addToast(res?.message || 'Student application updated successfully.', 'success');
      setIsEditing(false);
      await fetchDetail();
      if (onApplicationUpdated) {
        onApplicationUpdated();
      }
    } catch (err) {
      const status = err?.response?.status;
      const apiMsg = err?.response?.data?.message;
      if (status === 409) {
        const conflictMsg =
          apiMsg || 'This application is locked and can no longer be edited.';
        addToast(conflictMsg, 'error');
        setIsEditing(false);
        await fetchDetail();
        if (onApplicationUpdated) {
          onApplicationUpdated();
        }
      } else if (status === 404) {
        setSaveError('This application no longer exists.');
      } else {
        setSaveError(apiMsg || 'Failed to save application changes. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleOpenReviewAction = (action) => {
    if (
      !application ||
      saving ||
      reviewSubmitting ||
      isEditing ||
      !canReviewApplication(application.status)
    ) {
      return;
    }
    setReviewError('');
    setActiveReviewAction(action);
  };

  const handleCloseReviewDialog = () => {
    if (reviewSubmitting) return;
    setActiveReviewAction(null);
    setReviewError('');
  };

  const executeReviewAction = async (actionFn, fallbackError, defaultSuccessMessage) => {
    if (reviewSubmittingRef.current || saving || !application) return;

    try {
      reviewSubmittingRef.current = true;
      setReviewSubmitting(true);
      setReviewError('');

      const res = await actionFn();
      addToast(res?.message || defaultSuccessMessage, 'success');
      setActiveReviewAction(null);

      await fetchDetail();
      if (onApplicationUpdated) {
        onApplicationUpdated();
      }
    } catch (err) {
      const { isConflict, message } = getReviewErrorDetails(err, fallbackError);
      if (isConflict) {
        addToast(message, 'error');
        setActiveReviewAction(null);
        await fetchDetail();
        if (onApplicationUpdated) {
          onApplicationUpdated();
        }
      } else {
        setReviewError(message);
      }
    } finally {
      reviewSubmittingRef.current = false;
      setReviewSubmitting(false);
    }
  };

  const handleConfirmApprove = () =>
    executeReviewAction(
      () => approveAdminApplication(application._id),
      'Failed to approve student application. Please try again.',
      'Student application approved and permanent student record created successfully.'
    );

  const handleSubmitCorrection = (correctionMessage) =>
    executeReviewAction(
      () => requestAdminApplicationCorrection(application._id, correctionMessage),
      'Failed to submit correction request. Please try again.',
      'Correction requested successfully.'
    );

  const handleSubmitReject = (rejectionReason) =>
    executeReviewAction(
      () => rejectAdminApplication(application._id, rejectionReason),
      'Failed to reject student application. Please try again.',
      'Student application rejected successfully.'
    );

  if (!isOpen) return null;

  const canEdit = Boolean(application && isApplicationEditable(application.status));
  const canReview = Boolean(application && canReviewApplication(application.status));

  const statusBadge =
    STATUS_BADGE_STYLES[application?.status] ||
    'bg-[#EBE2CC] text-[#252821] border-[#CFC5B1]';

  const photoUrl = application?.photo?.url?.trim() || '';
  const hasValidPhoto = Boolean(photoUrl) && !photoLoadError;

  const sortedHistory = Array.isArray(application?.reviewHistory)
    ? [...application.reviewHistory].sort(
        (a, b) => new Date(a.timestamp || 0) - new Date(b.timestamp || 0)
      )
    : [];

  const reviewerLabel = application?.reviewedBy
    ? application.reviewedBy.name || application.reviewedBy.email || 'Authorized Reviewer'
    : 'Not reviewed yet';

  return (
    <div
      className="fixed inset-0 z-50 bg-[#252821]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="application-detail-modal-title"
      onClick={handleRequestClose}
    >
      <div
        className="bg-[#F4EFE3] rounded-sm max-w-3xl w-full max-h-[90vh] flex flex-col border border-[#CFC5B1] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="bg-[#34483B] px-5 sm:px-6 py-4 text-[#F4EFE3] flex items-center justify-between gap-3 border-b-2 border-[#AD8746] shrink-0">
          <div className="min-w-0">
            <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AD8746] block">
              {isEditing ? 'Edit Student Application' : 'Student Application Details'}
            </span>
            <h2
              id="application-detail-modal-title"
              className="font-serif font-bold text-lg sm:text-xl truncate"
            >
              {application?.applicationNumber || 'Application Review'}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {application?.status && (
              <span
                className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${statusBadge}`}
              >
                {application.status}
              </span>
            )}
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={saving || reviewSubmitting}
              className="p-1.5 rounded-sm text-[#EBE2CC] hover:text-white hover:bg-[#27372D] disabled:opacity-50 transition-colors"
              aria-label="Close application details"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-10">
              <LoadingSpinner text="Loading application details..." />
            </div>
          ) : error ? (
            <div
              role="alert"
              className="bg-white border border-rose-300 rounded-sm p-6 text-center space-y-4"
            >
              <div className="w-11 h-11 mx-auto rounded-sm bg-rose-50 border border-rose-200 text-rose-700 flex items-center justify-center text-xl">
                <FiAlertCircle />
              </div>
              <p className="text-sm text-[#252821] font-medium">{error}</p>
              <button
                type="button"
                onClick={fetchDetail}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold transition-colors"
              >
                <FiRefreshCw />
                <span>Retry</span>
              </button>
            </div>
          ) : application && isEditing ? (
            <ApplicationEditForm
              values={editValues}
              errors={editErrors}
              saveError={saveError}
              saving={saving}
              onChange={handleEditFieldChange}
              onSubmit={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : application ? (
            <>
              {/* A. Application Information */}
              <section className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
                  Application Information
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Application Number
                    </dt>
                    <dd className="font-mono font-bold text-[#34483B] mt-0.5 break-all">
                      {application.applicationNumber}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Current Status
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${statusBadge}`}
                      >
                        {application.status}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Submission Date
                    </dt>
                    <dd className="text-[#252821] font-medium mt-0.5">
                      {formatDateTime(application.createdAt) || 'Not provided'}
                    </dd>
                  </div>
                  {application.updatedAt && (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Last Updated
                      </dt>
                      <dd className="text-[#252821] font-medium mt-0.5">
                        {formatDateTime(application.updatedAt)}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* B. Student Information & D. Student Photo */}
              <section className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
                  Student Information &amp; Photograph
                </h3>
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="shrink-0">
                    {hasValidPhoto ? (
                      <img
                        src={photoUrl}
                        alt={`${application.fullName} photograph`}
                        onError={() => setPhotoLoadError(true)}
                        className="w-28 h-32 object-cover rounded-sm border border-[#CFC5B1] bg-[#EBE2CC]"
                      />
                    ) : (
                      <div className="w-28 h-32 rounded-sm border border-dashed border-[#CFC5B1] bg-[#EBE2CC]/60 flex flex-col items-center justify-center text-center p-2 text-[#55594E]">
                        <FiUser className="text-2xl mb-1 text-[#34483B]/60" />
                        <span className="text-[11px] font-medium leading-tight">
                          {photoLoadError ? 'Photo unavailable' : 'No photo uploaded'}
                        </span>
                      </div>
                    )}
                  </div>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm flex-1 w-full">
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Full Name
                      </dt>
                      <dd className="font-semibold text-[#252821] mt-0.5">
                        {application.fullName || 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Class Applying For
                      </dt>
                      <dd className="font-semibold text-[#34483B] mt-0.5">
                        {application.classApplyingFor || 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Date of Birth
                      </dt>
                      <dd className="text-[#252821] font-medium mt-0.5">
                        {formatDate(application.dateOfBirth) || 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Gender
                      </dt>
                      <dd className="text-[#252821] font-medium mt-0.5">
                        {application.gender || 'Not provided'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              {/* C. Parent & Contact Information */}
              <section className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
                  Parent &amp; Contact Information
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Father&apos;s Name
                    </dt>
                    <dd className="font-medium text-[#252821] mt-0.5">
                      {application.fatherName || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Mother&apos;s Name
                    </dt>
                    <dd className="font-medium text-[#252821] mt-0.5">
                      {application.motherName || 'Not provided'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Contact Number
                    </dt>
                    <dd className="mt-0.5">
                      {application.contactNumber ? (
                        <a
                          href={`tel:${application.contactNumber}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-[#34483B] hover:text-[#AD8746]"
                        >
                          <FiPhone className="text-xs text-[#AD8746]" />
                          <span>{application.contactNumber}</span>
                        </a>
                      ) : (
                        <span className="text-[#55594E]">Not provided</span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Email Address
                    </dt>
                    <dd className="mt-0.5 break-all">
                      {application.email ? (
                        <a
                          href={`mailto:${application.email}`}
                          className="inline-flex items-center gap-1.5 font-medium text-[#34483B] hover:text-[#AD8746]"
                        >
                          <FiMail className="text-xs text-[#AD8746] shrink-0" />
                          <span>{application.email}</span>
                        </a>
                      ) : (
                        <span className="text-[#55594E]">Not provided</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* E. Review Information */}
              <section className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
                  Review Information
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Reviewed By
                    </dt>
                    <dd className="font-medium text-[#252821] mt-0.5">{reviewerLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Reviewed At
                    </dt>
                    <dd className="font-medium text-[#252821] mt-0.5">
                      {application.reviewedAt
                        ? formatDateTime(application.reviewedAt)
                        : 'Not reviewed yet'}
                    </dd>
                  </div>

                  {application.reviewNotes && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        {application.status === 'Rejected' ? 'Rejection Reason' : 'Review Notes'}
                      </dt>
                      <dd
                        className={`mt-1 p-3 rounded-sm text-xs sm:text-sm whitespace-pre-wrap border ${
                          application.status === 'Rejected'
                            ? 'bg-rose-50 border-rose-200 text-rose-900'
                            : 'bg-[#F4EFE3] border-[#CFC5B1] text-[#252821]'
                        }`}
                      >
                        {application.reviewNotes}
                      </dd>
                    </div>
                  )}

                  {application.correctionMessage && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Correction Message
                      </dt>
                      <dd className="mt-1 p-3 bg-orange-50 border border-orange-200 rounded-sm text-xs sm:text-sm text-orange-900 whitespace-pre-wrap">
                        {application.correctionMessage}
                      </dd>
                    </div>
                  )}

                  {application.approvedStudentId && (
                    <div className="sm:col-span-2">
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Approved Student ID
                      </dt>
                      <dd className="mt-1 inline-flex items-center gap-1.5 font-mono text-xs sm:text-sm font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-sm">
                        <FiCheckCircle className="text-emerald-600" />
                        <span>{application.approvedStudentId}</span>
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* F. Review History Timeline */}
              <section className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
                  Review History Timeline
                </h3>

                {sortedHistory.length === 0 ? (
                  <p className="text-xs sm:text-sm text-[#55594E]">
                    No review history recorded yet.
                  </p>
                ) : (
                  <ol className="space-y-3">
                    {sortedHistory.map((entry, idx) => {
                      const actorName =
                        entry.performedBy?.name ||
                        entry.performedBy?.email ||
                        entry.actorType ||
                        'System';

                      return (
                        <li
                          key={entry._id || `${entry.action}-${idx}`}
                          className="border-l-2 border-[#AD8746] pl-3.5 py-1 space-y-1"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider text-[#34483B]">
                              {getReviewHistoryActionLabel(entry.action)}
                            </span>
                            <span className="text-[11px] text-[#55594E] inline-flex items-center gap-1">
                              <FiClock className="text-[#AD8746]" />
                              {formatDateTime(entry.timestamp) || 'Unknown time'}
                            </span>
                          </div>
                          <p className="text-xs text-[#55594E]">
                            By <span className="font-semibold text-[#252821]">{actorName}</span>
                            {entry.actorType ? ` (${entry.actorType})` : ''}
                          </p>
                          {entry.note && (
                            <p className="text-xs text-[#252821] bg-[#F4EFE3] px-2.5 py-1.5 rounded-sm border border-[#CFC5B1]/70">
                              {entry.note}
                            </p>
                          )}
                          {Array.isArray(entry.changedFields) && entry.changedFields.length > 0 && (
                            <p className="text-[11px] text-[#55594E]">
                              Changed fields:{' '}
                              <span className="font-mono text-[#34483B]">
                                {entry.changedFields.join(', ')}
                              </span>
                            </p>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                )}
              </section>
            </>
          ) : null}
        </div>

        {/* Modal Footer (Read-Only Mode) */}
        {!isEditing && (
          <div className="bg-[#EBE2CC] px-5 sm:px-6 py-3.5 border-t border-[#CFC5B1] flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div>
              {application && !canReview && (
                <span className="inline-flex items-center gap-1.5 text-xs text-[#55594E] font-medium">
                  <FiLock className="text-[#AD8746]" />
                  <span>
                    {application.status} applications are locked from editing and review actions
                  </span>
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 ml-auto">
              {canReview && (
                <>
                  <button
                    type="button"
                    onClick={() => handleOpenReviewAction('approve')}
                    disabled={reviewSubmitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    <FiCheckCircle />
                    <span>Approve Application</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReviewAction('correction')}
                    disabled={reviewSubmitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    <FiEdit3 />
                    <span>Request Correction</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenReviewAction('reject')}
                    disabled={reviewSubmitting}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-rose-700 hover:bg-rose-800 text-white text-xs font-semibold disabled:opacity-50 transition-colors"
                  >
                    <FiXCircle />
                    <span>Reject Application</span>
                  </button>
                </>
              )}

              {canEdit && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  disabled={reviewSubmitting}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  <FiEdit2 className="text-[#AD8746]" />
                  <span>Edit Application</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleRequestClose}
                disabled={reviewSubmitting}
                className="px-4 py-2 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#34483B] text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <ApplicationReviewDialogs
        activeAction={activeReviewAction}
        application={application}
        submitting={reviewSubmitting}
        error={reviewError}
        onClose={handleCloseReviewDialog}
        onConfirmApprove={handleConfirmApprove}
        onSubmitCorrection={handleSubmitCorrection}
        onSubmitReject={handleSubmitReject}
      />
    </div>
  );
};

export default ApplicationDetailModal;
