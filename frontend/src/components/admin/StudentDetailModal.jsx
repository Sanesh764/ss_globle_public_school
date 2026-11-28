import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  FiX,
  FiAlertCircle,
  FiRefreshCw,
  FiUser,
  FiPhone,
  FiMail,
  FiEdit2,
  FiCheckCircle,
  FiUserX,
} from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';
import StudentEditForm from './StudentEditForm';
import StudentStatusConfirmDialog from './StudentStatusConfirmDialog';
import {
  getAdminStudentById,
  updateAdminStudent,
  updateAdminStudentStatus,
} from '../../services/adminStudentService';
import { formatDate, formatDateTime } from '../../utils/formatDate';
import { useToast } from '../../hooks/useToast';
import {
  normalizeStudentDetail,
  getStudentDetailErrorMessage,
} from '../../utils/adminStudentDetailUtils';
import {
  buildStudentEditFormValues,
  validateAdminStudentEdit,
  buildAdminStudentUpdatePayload,
  hasUnsavedStudentEditChanges,
  getStudentEditErrorDetails,
} from '../../utils/adminStudentEditUtils';
import {
  getStudentStatusActionConfig,
  getStudentStatusErrorDetails,
} from '../../utils/adminStudentStatusUtils';

const StudentDetailModal = ({ studentId, isOpen, onClose, onStudentUpdated }) => {
  const { addToast } = useToast();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [photoLoadError, setPhotoLoadError] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState(buildStudentEditFormValues());
  const [editErrors, setEditErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);

  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [statusSubmitting, setStatusSubmitting] = useState(false);
  const [statusError, setStatusError] = useState('');

  const requestIdRef = useRef(0);
  const savingRef = useRef(false);
  const statusSubmittingRef = useRef(false);

  const fetchDetail = useCallback(async () => {
    if (!isOpen || !studentId) return;

    const currentRequestId = ++requestIdRef.current;

    try {
      setLoading(true);
      setError('');
      setStudent(null);
      setPhotoLoadError(false);

      const res = await getAdminStudentById(studentId);
      if (currentRequestId !== requestIdRef.current) return;

      const normalized = normalizeStudentDetail(res);
      if (!normalized) {
        setError('Student details could not be loaded.');
        return;
      }

      setStudent(normalized);
    } catch (err) {
      if (currentRequestId !== requestIdRef.current) return;
      setError(getStudentDetailErrorMessage(err));
    } finally {
      if (currentRequestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [studentId, isOpen]);

  useEffect(() => {
    if (isOpen && studentId) {
      setIsEditing(false);
      setEditErrors({});
      setSaveError('');
      setSaving(false);
      savingRef.current = false;
      setStatusDialogOpen(false);
      setStatusError('');
      setStatusSubmitting(false);
      statusSubmittingRef.current = false;
      fetchDetail();
    } else {
      setStudent(null);
      setError('');
      setPhotoLoadError(false);
      setIsEditing(false);
      setEditErrors({});
      setSaveError('');
      setSaving(false);
      savingRef.current = false;
      setStatusDialogOpen(false);
      setStatusError('');
      setStatusSubmitting(false);
      statusSubmittingRef.current = false;
    }
  }, [isOpen, studentId, fetchDetail]);

  const handleRequestClose = useCallback(() => {
    if (saving || statusSubmitting) return;
    if (statusDialogOpen) {
      setStatusDialogOpen(false);
      setStatusError('');
      return;
    }
    if (isEditing && hasUnsavedStudentEditChanges(editValues, student)) {
      const confirmed = window.confirm(
        'You have unsaved changes. Discard changes and close?'
      );
      if (!confirmed) return;
    }
    setIsEditing(false);
    setEditErrors({});
    setSaveError('');
    onClose();
  }, [
    saving,
    statusSubmitting,
    statusDialogOpen,
    isEditing,
    editValues,
    student,
    onClose,
  ]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (statusDialogOpen) {
          if (!statusSubmitting) {
            setStatusDialogOpen(false);
            setStatusError('');
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
  }, [isOpen, statusDialogOpen, statusSubmitting, handleRequestClose]);

  const handleStartEdit = () => {
    if (!student || loading || error || saving || statusSubmitting || statusDialogOpen) {
      return;
    }
    setEditValues(buildStudentEditFormValues(student));
    setEditErrors({});
    setSaveError('');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    if (saving) return;
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
    if (savingRef.current || statusSubmittingRef.current || !student) return;

    setSaveError('');
    const validationErrors = validateAdminStudentEdit(editValues);
    if (Object.keys(validationErrors).length > 0) {
      setEditErrors(validationErrors);
      return;
    }

    const payload = buildAdminStudentUpdatePayload(editValues, student);
    if (Object.keys(payload).length === 0) {
      addToast('No changes detected.', 'info');
      setIsEditing(false);
      return;
    }

    try {
      savingRef.current = true;
      setSaving(true);
      const res = await updateAdminStudent(student._id, payload);
      addToast(res?.message || 'Student updated successfully.', 'success');
      setIsEditing(false);
      await fetchDetail();
      if (onStudentUpdated) {
        onStudentUpdated();
      }
    } catch (err) {
      const { isConflict, message } = getStudentEditErrorDetails(err);
      if (isConflict) {
        addToast(message, 'error');
        setIsEditing(false);
        await fetchDetail();
        if (onStudentUpdated) {
          onStudentUpdated();
        }
      } else {
        setSaveError(message);
      }
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  const handleOpenStatusDialog = () => {
    if (!student || loading || error || saving || isEditing || statusSubmitting) {
      return;
    }
    setStatusError('');
    setStatusDialogOpen(true);
  };

  const handleCloseStatusDialog = () => {
    if (statusSubmitting) return;
    setStatusDialogOpen(false);
    setStatusError('');
  };

  const handleConfirmStatusChange = async (nextIsActive) => {
    if (statusSubmittingRef.current || savingRef.current || !student) return;

    const config = getStudentStatusActionConfig(student.isActive);

    try {
      statusSubmittingRef.current = true;
      setStatusSubmitting(true);
      setStatusError('');

      const res = await updateAdminStudentStatus(student._id, nextIsActive);
      addToast(
        res?.message || config?.successFallback || 'Student status updated successfully.',
        'success'
      );
      setStatusDialogOpen(false);
      await fetchDetail();
      if (onStudentUpdated) {
        onStudentUpdated();
      }
    } catch (err) {
      const { shouldRefresh, message } = getStudentStatusErrorDetails(err);
      if (shouldRefresh) {
        addToast(message, 'error');
        setStatusDialogOpen(false);
        await fetchDetail();
        if (onStudentUpdated) {
          onStudentUpdated();
        }
      } else {
        setStatusError(message);
      }
    } finally {
      statusSubmittingRef.current = false;
      setStatusSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const hasValidPhoto = Boolean(student?.photoUrl) && !photoLoadError;
  const statusActionConfig = student ? getStudentStatusActionConfig(student.isActive) : null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#252821]/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-labelledby="student-detail-modal-title"
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
              {isEditing ? 'Edit Student Record' : 'Student Record Details'}
            </span>
            <h2
              id="student-detail-modal-title"
              className="font-serif font-bold text-lg sm:text-xl truncate"
            >
              {student?.fullName || 'Student Details'}
            </h2>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {student && (
              <span
                className={`hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${
                  student.isActive
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}
              >
                {student.isActive ? 'Active' : 'Inactive'}
              </span>
            )}
            <button
              type="button"
              onClick={handleRequestClose}
              disabled={saving || statusSubmitting}
              className="p-1.5 rounded-sm text-[#EBE2CC] hover:text-white hover:bg-[#27372D] disabled:opacity-50 transition-colors"
              aria-label="Close student details"
            >
              <FiX className="text-xl" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {loading ? (
            <div className="py-10">
              <LoadingSpinner text="Loading student details..." />
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
          ) : student && isEditing ? (
            <StudentEditForm
              values={editValues}
              errors={editErrors}
              saveError={saveError}
              saving={saving}
              onChange={handleEditFieldChange}
              onSubmit={handleSaveEdit}
              onCancel={handleCancelEdit}
            />
          ) : student ? (
            <>
              {/* A. Student Information & Photo */}
              <section className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
                  Student Information
                </h3>
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="shrink-0">
                    {hasValidPhoto ? (
                      <img
                        src={student.photoUrl}
                        alt={`${student.fullName} photograph`}
                        onError={() => setPhotoLoadError(true)}
                        className="w-28 h-32 object-cover rounded-sm border border-[#CFC5B1] bg-[#EBE2CC]"
                      />
                    ) : (
                      <div className="w-28 h-32 rounded-sm border border-dashed border-[#CFC5B1] bg-[#EBE2CC]/60 flex flex-col items-center justify-center text-center p-2 text-[#55594E]">
                        <FiUser className="text-2xl mb-1 text-[#34483B]/60" />
                        <span className="text-[11px] font-medium leading-tight">
                          {photoLoadError ? 'Photo unavailable' : 'No photo available'}
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
                        {student.fullName}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Class
                      </dt>
                      <dd className="font-semibold text-[#34483B] mt-0.5">
                        {student.className}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Date of Birth
                      </dt>
                      <dd className="text-[#252821] font-medium mt-0.5">
                        {formatDate(student.dateOfBirth) || 'Not provided'}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Gender
                      </dt>
                      <dd className="text-[#252821] font-medium mt-0.5">
                        {student.gender}
                      </dd>
                    </div>
                  </dl>
                </div>
              </section>

              {/* B. Parent & Contact Information */}
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
                      {student.fatherName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Mother&apos;s Name
                    </dt>
                    <dd className="font-medium text-[#252821] mt-0.5">
                      {student.motherName}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Contact Number
                    </dt>
                    <dd className="mt-0.5">
                      {student.contactNumber ? (
                        <a
                          href={`tel:${student.contactNumber}`}
                          className="inline-flex items-center gap-1.5 font-semibold text-[#34483B] hover:text-[#AD8746]"
                        >
                          <FiPhone className="text-xs text-[#AD8746]" />
                          <span>{student.contactNumber}</span>
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
                      {student.email ? (
                        <a
                          href={`mailto:${student.email}`}
                          className="inline-flex items-center gap-1.5 font-medium text-[#34483B] hover:text-[#AD8746]"
                        >
                          <FiMail className="text-xs text-[#AD8746] shrink-0" />
                          <span>{student.email}</span>
                        </a>
                      ) : (
                        <span className="text-[#55594E]">Not provided</span>
                      )}
                    </dd>
                  </div>
                </dl>
              </section>

              {/* C. Admission Information */}
              <section className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
                  Admission Information
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Admission Number
                    </dt>
                    <dd className="font-mono font-bold text-[#34483B] mt-0.5 break-all">
                      {student.admissionNumber || (
                        <span className="font-sans font-normal italic text-[#55594E]">
                          Not assigned
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Enrollment Status
                    </dt>
                    <dd className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-sm border text-[11px] font-bold uppercase tracking-wider ${
                          student.isActive
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        {student.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Application Number
                    </dt>
                    <dd className="font-mono text-xs sm:text-sm font-medium text-[#252821] mt-0.5 break-all">
                      {student.applicationNumber || 'Not available'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Admission Date
                    </dt>
                    <dd className="text-[#252821] font-medium mt-0.5">
                      {formatDateTime(student.admittedAt) || 'Not available'}
                    </dd>
                  </div>
                  {student.createdAt && (
                    <div>
                      <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                        Record Created
                      </dt>
                      <dd className="text-[#252821] font-medium mt-0.5">
                        {formatDateTime(student.createdAt)}
                      </dd>
                    </div>
                  )}
                </dl>
              </section>

              {/* D. Admission Metadata */}
              <section className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
                  Admission Metadata
                </h3>
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Admitted By
                    </dt>
                    <dd className="font-medium text-[#252821] mt-0.5">
                      {student.admittedBy.name}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Admin Email
                    </dt>
                    <dd className="text-[#252821] mt-0.5 break-all">
                      {student.admittedBy.email}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                      Admin Role
                    </dt>
                    <dd className="text-[#252821] uppercase text-xs font-semibold mt-1">
                      {student.admittedBy.role}
                    </dd>
                  </div>
                </dl>
              </section>
            </>
          ) : null}
        </div>

        {/* Modal Footer (Read-Only Mode) */}
        {!isEditing && (
          <div className="bg-[#EBE2CC] px-5 sm:px-6 py-3.5 border-t border-[#CFC5B1] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
            <div>
              {student && !loading && !error && statusActionConfig && (
                <button
                  type="button"
                  onClick={handleOpenStatusDialog}
                  disabled={statusSubmitting}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-sm text-white text-xs font-semibold disabled:opacity-50 transition-colors ${
                    statusActionConfig.actionType === 'deactivate'
                      ? 'bg-rose-700 hover:bg-rose-800'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  {statusActionConfig.actionType === 'deactivate' ? (
                    <FiUserX />
                  ) : (
                    <FiCheckCircle />
                  )}
                  <span>{statusActionConfig.buttonLabel}</span>
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5 ml-auto">
              {student && !loading && !error && (
                <button
                  type="button"
                  onClick={handleStartEdit}
                  disabled={statusSubmitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-xs font-semibold disabled:opacity-50 transition-colors"
                >
                  <FiEdit2 className="text-[#AD8746]" />
                  <span>Edit Student</span>
                </button>
              )}
              <button
                type="button"
                onClick={handleRequestClose}
                disabled={statusSubmitting}
                className="px-5 py-2 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#34483B] text-xs font-semibold disabled:opacity-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>

      <StudentStatusConfirmDialog
        isOpen={statusDialogOpen}
        student={student}
        submitting={statusSubmitting}
        error={statusError}
        onCancel={handleCloseStatusDialog}
        onConfirm={handleConfirmStatusChange}
      />
    </div>
  );
};

export default StudentDetailModal;
