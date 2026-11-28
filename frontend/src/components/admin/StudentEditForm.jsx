import React from 'react';
import { FiAlertCircle, FiSave, FiX } from 'react-icons/fi';
import { CLASS_OPTIONS, GENDER_OPTIONS } from '../../utils/constants';

const getTodayIndiaDateString = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const StudentEditForm = ({
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
            <label htmlFor="student-edit-fullName" className={labelClass}>
              Student Full Name <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="student-edit-fullName"
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
            <label htmlFor="student-edit-dateOfBirth" className={labelClass}>
              Date of Birth <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="student-edit-dateOfBirth"
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
            <label htmlFor="student-edit-gender" className={labelClass}>
              Gender <span className="text-[#8B2E2E]">*</span>
            </label>
            <select
              id="student-edit-gender"
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
            <label htmlFor="student-edit-className" className={labelClass}>
              Class <span className="text-[#8B2E2E]">*</span>
            </label>
            <select
              id="student-edit-className"
              name="className"
              value={values.className}
              onChange={onChange}
              disabled={saving}
              className={inputClass(Boolean(errors.className))}
            >
              <option value="">Select class</option>
              {CLASS_OPTIONS.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
            {errors.className && (
              <p className="mt-1 text-xs text-[#8B2E2E] font-medium">{errors.className}</p>
            )}
          </div>

          <div>
            <label htmlFor="student-edit-fatherName" className={labelClass}>
              Father&apos;s Name <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="student-edit-fatherName"
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
            <label htmlFor="student-edit-motherName" className={labelClass}>
              Mother&apos;s Name <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="student-edit-motherName"
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
            <label htmlFor="student-edit-contactNumber" className={labelClass}>
              Contact Number <span className="text-[#8B2E2E]">*</span>
            </label>
            <input
              id="student-edit-contactNumber"
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
            <label htmlFor="student-edit-email" className={labelClass}>
              Email Address <span className="text-[#55594E] font-normal">(Optional)</span>
            </label>
            <input
              id="student-edit-email"
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

export default StudentEditForm;
