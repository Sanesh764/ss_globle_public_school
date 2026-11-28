import React from 'react';
import { FiAlertCircle, FiSave, FiX } from 'react-icons/fi';
import { CLASS_OPTIONS, GENDER_OPTIONS } from '../../utils/constants';
import { EDIT_NOTE_MAX_LENGTH } from '../../utils/adminApplicationEditUtils';

const getTodayIndiaDateString = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const ApplicationEditForm = ({
  values,
  errors,
  saveError,
  saving,
  onChange,
  onSubmit,
  onCancel,
}) => {
  const inputClass = (hasError = false) =>
    `w-full px-3 py-2 bg-[#F4EFE3] border ${
      hasError ? 'border-[#8B2E2E]' : 'border-[#CFC5B1]'
    } rounded-sm text-sm text-[#252821] focus:outline-none focus:border-[#34483B] focus:ring-1 focus:ring-[#34483B]`;

  const labelClass =
    'block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1';

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {saveError && (
        <div
          role="alert"
          className="p-3.5 bg-rose-50 border border-rose-300 rounded-sm text-rose-800 text-xs sm:text-sm font-medium flex items-start gap-2"
        >
          <FiAlertCircle className="text-base shrink-0 mt-0.5" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#34483B] border-b border-[#CFC5B1] pb-2">
          Edit Student &amp; Parent Details
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label htmlFor="edit-fullName" className={labelClass}>
              Student Full Name <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="edit-fullName"
              name="fullName"
              type="text"
              value={values.fullName}
              onChange={onChange}
              disabled={saving}
              className={inputClass(Boolean(errors.fullName))}
            />
            {errors.fullName && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-dateOfBirth" className={labelClass}>
              Date of Birth <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="edit-dateOfBirth"
              name="dateOfBirth"
              type="date"
              max={getTodayIndiaDateString()}
              value={values.dateOfBirth}
              onChange={onChange}
              disabled={saving}
              className={inputClass(Boolean(errors.dateOfBirth))}
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.dateOfBirth}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-gender" className={labelClass}>
              Gender <span className="text-[#8B2E2E]">*</span>
            </label>
            <select
              id="edit-gender"
              name="gender"
              value={values.gender}
              onChange={onChange}
              disabled={saving}
              className={inputClass(Boolean(errors.gender))}
            >
              <option value="">Select gender</option>
              {GENDER_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {errors.gender && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.gender}</p>
            )}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="edit-classApplyingFor" className={labelClass}>
              Class Applying For <span className="text-[#8B2E2E]">*</span>
            </label>
            <select
              id="edit-classApplyingFor"
              name="classApplyingFor"
              value={values.classApplyingFor}
              onChange={onChange}
              disabled={saving}
              className={inputClass(Boolean(errors.classApplyingFor))}
            >
              <option value="">Select class</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {errors.classApplyingFor && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.classApplyingFor}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-fatherName" className={labelClass}>
              Father&apos;s Name <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="edit-fatherName"
              name="fatherName"
              type="text"
              value={values.fatherName}
              onChange={onChange}
              disabled={saving}
              className={inputClass(Boolean(errors.fatherName))}
            />
            {errors.fatherName && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.fatherName}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-motherName" className={labelClass}>
              Mother&apos;s Name <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="edit-motherName"
              name="motherName"
              type="text"
              value={values.motherName}
              onChange={onChange}
              disabled={saving}
              className={inputClass(Boolean(errors.motherName))}
            />
            {errors.motherName && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.motherName}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-contactNumber" className={labelClass}>
              Contact Number <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="edit-contactNumber"
              name="contactNumber"
              type="tel"
              value={values.contactNumber}
              onChange={onChange}
              disabled={saving}
              className={inputClass(Boolean(errors.contactNumber))}
            />
            {errors.contactNumber && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.contactNumber}</p>
            )}
          </div>

          <div>
            <label htmlFor="edit-email" className={labelClass}>
              Email Address <span className="text-[#55594E] font-normal">(Optional)</span>
            </label>
            <input
              id="edit-email"
              name="email"
              type="email"
              value={values.email}
              onChange={onChange}
              disabled={saving}
              placeholder="Not provided"
              className={inputClass(Boolean(errors.email))}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Internal Audit Edit Note (not a student/parent field) */}
      <div className="bg-white border border-[#CFC5B1] rounded-sm p-4 sm:p-5 space-y-2">
        <label htmlFor="edit-note" className={labelClass}>
          Internal Edit Note{' '}
          <span className="text-[#55594E] font-normal">(Optional — Audit Log Only)</span>
        </label>
        <textarea
          id="edit-note"
          name="note"
          rows={2}
          maxLength={EDIT_NOTE_MAX_LENGTH}
          value={values.note}
          onChange={onChange}
          disabled={saving}
          placeholder="Optional reason for editing (recorded in review history only)..."
          className={inputClass(Boolean(errors.note))}
        />
        {errors.note && (
          <p className="text-xs text-[#8B2E2E] font-medium">{errors.note}</p>
        )}
      </div>

      <div className="flex flex-wrap justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] hover:bg-[#DED5C1] disabled:opacity-50 text-[#34483B] text-xs font-semibold transition-colors"
        >
          <FiX />
          <span>Cancel</span>
        </button>
        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-5 py-2 rounded-sm bg-[#34483B] hover:bg-[#27372D] disabled:opacity-60 text-[#F4EFE3] text-xs font-semibold tracking-wide transition-colors"
        >
          <FiSave className="text-[#AD8746]" />
          <span>{saving ? 'Saving Changes...' : 'Save Changes'}</span>
        </button>
      </div>
    </form>
  );
};

export default ApplicationEditForm;
