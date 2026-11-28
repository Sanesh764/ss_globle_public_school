import React, { useState, useEffect, useRef, useContext } from 'react';
import {
  FiCheckCircle,
  FiAlertCircle,
  FiCopy,
  FiCheck,
  FiUploadCloud,
  FiTrash2,
  FiSend,
  FiInfo,
  FiPhone,
} from 'react-icons/fi';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import { SettingContext } from '../../context/SettingContext';
import { useToast } from '../../hooks/useToast';
import { CLASS_OPTIONS, GENDER_OPTIONS } from '../../utils/constants';
import {
  validateStudentRegistration,
  validateStudentPhoto,
} from '../../utils/registrationValidator';
import { submitStudentRegistration } from '../../services/registrationService';
import { formatDate } from '../../utils/formatDate';

const INITIAL_FORM_VALUES = {
  fullName: '',
  dateOfBirth: '',
  gender: '',
  classApplyingFor: '',
  fatherName: '',
  motherName: '',
  contactNumber: '',
  email: '',
};

const getTodayIndiaDateString = () =>
  new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

const StudentRegistration = () => {
  const { settings } = useContext(SettingContext);
  const { addToast } = useToast();

  const [values, setValues] = useState(INITIAL_FORM_VALUES);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submittedApplication, setSubmittedApplication] = useState(null);
  const [copiedRef, setCopiedRef] = useState(false);

  const fileInputRef = useRef(null);
  const previewUrlRef = useRef('');

  const revokePreviewUrl = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = '';
    }
  };

  useEffect(() => {
    return () => {
      revokePreviewUrl();
    };
  }, []);

  const clearFieldError = (field) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    clearFieldError(name);
    if (serverError) setServerError('');
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;

    const photoError = validateStudentPhoto(file);
    if (photoError) {
      setErrors((prev) => ({ ...prev, photo: photoError }));
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      return;
    }

    revokePreviewUrl();
    const nextUrl = URL.createObjectURL(file);
    previewUrlRef.current = nextUrl;
    setPhotoFile(file);
    setPhotoPreviewUrl(nextUrl);
    clearFieldError('photo');
    if (serverError) setServerError('');
  };

  const handleRemovePhoto = () => {
    revokePreviewUrl();
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    clearFieldError('photo');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const resolveErrorMessage = (err) => {
    const status = err?.response?.status;
    const apiMsg = err?.response?.data?.message;

    if (status === 400) {
      return apiMsg || 'Please check the entered registration details and try again.';
    }
    if (status === 429) {
      return (
        apiMsg ||
        'Too many registration applications submitted from your connection. Please wait a few minutes and try again.'
      );
    }
    if (status === 502) {
      return (
        apiMsg ||
        'Photograph upload failed temporarily. Please try submitting again or remove the photograph.'
      );
    }
    if (status === 503) {
      return (
        apiMsg ||
        'Photograph storage service is currently unavailable. Please try again later or submit without a photograph.'
      );
    }
    return apiMsg || 'Unable to submit registration right now. Please check your connection and try again.';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setServerError('');
    const validationErrors = validateStudentRegistration({
      ...values,
      photo: photoFile,
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      addToast('Please correct the highlighted fields before submitting.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const res = await submitStudentRegistration(values, photoFile);
      if (res?.success && res?.data?.application) {
        revokePreviewUrl();
        setSubmittedApplication(res.data.application);
        addToast('Registration application submitted successfully.', 'success');
      } else {
        throw new Error('Unexpected response from registration server.');
      }
    } catch (err) {
      const message = resolveErrorMessage(err);
      setServerError(message);
      addToast(message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyApplicationNumber = async () => {
    const refNo = submittedApplication?.applicationNumber;
    if (!refNo) return;

    try {
      await navigator.clipboard.writeText(refNo);
      setCopiedRef(true);
      addToast('Application reference number copied.', 'success');
      setTimeout(() => setCopiedRef(false), 2500);
    } catch {
      addToast('Could not copy automatically. Please note down the reference number.', 'info');
    }
  };

  const handleResetForNewApplication = () => {
    revokePreviewUrl();
    setValues(INITIAL_FORM_VALUES);
    setPhotoFile(null);
    setPhotoPreviewUrl('');
    setErrors({});
    setServerError('');
    setSubmittedApplication(null);
    setCopiedRef(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const inputClass = (hasError = false) =>
    `w-full px-3.5 py-2.5 bg-[#F4EFE3] border ${
      hasError ? 'border-[#8B2E2E]' : 'border-[#CFC5B1]'
    } rounded-sm text-sm text-[#252821] placeholder-[#55594E]/60 focus:outline-none focus:border-[#34483B] focus:ring-1 focus:ring-[#34483B] transition-colors`;

  const labelClass =
    'block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5';

  const todayMaxDate = getTodayIndiaDateString();

  return (
    <main className="bg-[#F4EFE3] text-[#252821]">
      <SEO
        title="Student Registration 2026-27 | S.S. Global Public School Daudnagar"
        description="Submit an online student registration application for Class 1 to Class 12 at S.S. Global Public School, Daudnagar, Bihar. No account or login required."
        canonicalUrl="https://www.ssglobalpublicschool.com/register"
      />

      <PageHeader
        title="Student Self-Registration"
        subtitle="Apply online for admission to Class 1 through Class 12 for the upcoming academic session. No parent account or login is required."
        breadcrumb={[{ label: 'Student Registration' }]}
      />

      <section className="py-12 sm:py-14 bg-[#F4EFE3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
            {/* Left Column: Official Guidelines & Verification Notice */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-[#EBE2CC]/60 p-6 sm:p-7 rounded-sm border border-[#CFC5B1] space-y-5">
                <h2 className="text-xl font-bold font-serif text-[#34483B] border-l-2 border-[#AD8746] pl-3">
                  Registration Guidelines
                </h2>

                <p className="text-xs sm:text-sm text-[#55594E] leading-relaxed">
                  Parents or guardians may submit a student&apos;s preliminary registration
                  application online for <strong className="text-[#252821]">Class 1 to Class 12</strong>.
                </p>

                <div className="border-t border-[#CFC5B1] pt-4 space-y-2.5">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#34483B]">
                    Information Required
                  </h3>
                  <ul className="text-xs sm:text-sm text-[#252821] space-y-1.5 list-disc list-inside">
                    <li>Student&apos;s full name, date of birth, and gender</li>
                    <li>Class applying for (Class 1 – Class 12)</li>
                    <li>Father&apos;s name and mother&apos;s name</li>
                    <li>One active 10-digit Indian mobile number</li>
                    <li>Email address &amp; student photograph (optional)</li>
                  </ul>
                </div>

                <div className="border-t border-[#CFC5B1] pt-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#34483B]">
                    Photograph Requirements
                  </h3>
                  <p className="text-xs text-[#55594E] leading-relaxed">
                    Optional passport-size photograph in <strong>JPEG</strong>,{' '}
                    <strong>PNG</strong>, or <strong>WebP</strong> format (maximum{' '}
                    <strong>2 MB</strong>).
                  </p>
                </div>

                <div className="border-t border-[#CFC5B1] pt-4 space-y-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#34483B]">
                    After Submission
                  </h3>
                  <p className="text-xs text-[#55594E] leading-relaxed">
                    Your application will be saved with <strong>Pending</strong> status and
                    reviewed by the school admissions office. Submission is subject to
                    document verification and does not by itself confirm admission.
                  </p>
                </div>
              </div>

              <div className="bg-[#34483B] text-[#F4EFE3] p-6 rounded-sm border border-[#27372D] space-y-2.5">
                <h3 className="font-bold font-serif text-lg flex items-center gap-2">
                  <FiInfo className="text-[#AD8746] shrink-0" />
                  <span>Admissions Helpline</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#EBE2CC]/90 leading-relaxed">
                  For assistance with your registration, contact the school office during
                  working hours ({settings.officeHours || 'Mon - Sat: 8:00 AM - 3:00 PM'}).
                </p>
                <a
                  href={`tel:${settings.phone || '+919122490003'}`}
                  className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#AD8746] hover:text-[#F4EFE3] transition-colors pt-1"
                >
                  <FiPhone />
                  <span>{settings.phone || '+91 9122490003'}</span>
                </a>
              </div>
            </aside>

            {/* Right Column: Registration Form OR Confirmation Screen */}
            <div className="lg:col-span-8">
              {submittedApplication ? (
                <div className="bg-[#EBE2CC]/60 p-7 sm:p-10 rounded-sm border border-[#CFC5B1] space-y-6">
                  <div className="flex items-start gap-3.5 border-b border-[#CFC5B1] pb-5">
                    <div className="w-11 h-11 rounded-sm bg-[#34483B] text-[#F4EFE3] flex items-center justify-center shrink-0">
                      <FiCheckCircle className="text-xl text-[#AD8746]" />
                    </div>
                    <div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#AD8746]">
                        Application Received
                      </span>
                      <h2 className="text-2xl font-bold font-serif text-[#34483B] mt-0.5">
                        Registration Submitted Successfully
                      </h2>
                      <p className="text-xs sm:text-sm text-[#55594E] mt-1 leading-relaxed">
                        Your application has been recorded and is currently awaiting review
                        and verification by the S.S. Global Public School admissions office.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#CFC5B1]">
                      <div>
                        <span className="block text-[10px] font-semibold uppercase tracking-wider text-[#55594E]">
                          Application Reference Number
                        </span>
                        <span className="font-mono text-base sm:text-lg font-bold text-[#34483B] tracking-wide break-all">
                          {submittedApplication.applicationNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyApplicationNumber}
                        className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-sm border border-[#CFC5B1] bg-[#EBE2CC] hover:bg-[#DED5C1] text-[#34483B] text-xs font-semibold transition-colors shrink-0"
                      >
                        {copiedRef ? <FiCheck className="text-[#34483B]" /> : <FiCopy />}
                        <span>{copiedRef ? 'Copied' : 'Copy Reference No.'}</span>
                      </button>
                    </div>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                          Student Name
                        </dt>
                        <dd className="font-semibold text-[#252821] mt-0.5">
                          {submittedApplication.fullName}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                          Class Applied For
                        </dt>
                        <dd className="font-semibold text-[#252821] mt-0.5">
                          {submittedApplication.classApplyingFor}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                          Current Status
                        </dt>
                        <dd className="mt-1">
                          <span className="inline-block px-2.5 py-0.5 rounded-sm text-xs font-semibold bg-[#AD8746]/20 text-[#8E6D35] border border-[#AD8746]/40">
                            {submittedApplication.status || 'Pending'}
                          </span>
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[11px] font-semibold uppercase tracking-wider text-[#55594E]">
                          Submission Date
                        </dt>
                        <dd className="font-medium text-[#252821] mt-0.5">
                          {formatDate(submittedApplication.createdAt)}
                        </dd>
                      </div>
                    </dl>
                  </div>

                  <p className="text-xs text-[#55594E] leading-relaxed">
                    Please keep a note of your Application Reference Number for future
                    communication with the school office.
                  </p>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleResetForNewApplication}
                      className="px-6 py-3 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm tracking-wide transition-colors"
                    >
                      Submit Another Application
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#EBE2CC]/55 p-6 sm:p-10 rounded-sm border border-[#CFC5B1]">
                  <h2 className="text-2xl font-bold font-serif text-[#34483B] mb-1.5">
                    Student Registration Form
                  </h2>
                  <p className="text-[#55594E] text-sm mb-6">
                    Fields marked with <span className="text-[#8B2E2E] font-semibold">*</span>{' '}
                    are required.
                  </p>

                  {serverError && (
                    <div
                      role="alert"
                      className="mb-6 p-4 bg-[#8B2E2E]/10 border border-[#8B2E2E]/40 rounded-sm text-[#8B2E2E] text-sm font-medium flex items-start gap-2.5"
                    >
                      <FiAlertCircle className="text-lg shrink-0 mt-0.5" />
                      <span>{serverError}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} noValidate className="space-y-8">
                    {/* Section 1: Student Information */}
                    <fieldset className="space-y-4">
                      <legend className="text-base font-bold font-serif text-[#34483B] border-b border-[#CFC5B1] pb-2 w-full">
                        1. Student Information
                      </legend>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                        <div className="sm:col-span-2">
                          <label htmlFor="fullName" className={labelClass}>
                            Student Full Name <span className="text-[#8B2E2E]">*</span>
                          </label>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            autoComplete="name"
                            value={values.fullName}
                            onChange={handleFieldChange}
                            placeholder="Enter student's full name"
                            aria-invalid={Boolean(errors.fullName)}
                            aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                            className={inputClass(Boolean(errors.fullName))}
                          />
                          {errors.fullName && (
                            <p id="fullName-error" className="mt-1 text-xs text-[#8B2E2E] font-medium">
                              {errors.fullName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="dateOfBirth" className={labelClass}>
                            Date of Birth <span className="text-[#8B2E2E]">*</span>
                          </label>
                          <input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            required
                            max={todayMaxDate}
                            autoComplete="bday"
                            value={values.dateOfBirth}
                            onChange={handleFieldChange}
                            aria-invalid={Boolean(errors.dateOfBirth)}
                            aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
                            className={inputClass(Boolean(errors.dateOfBirth))}
                          />
                          {errors.dateOfBirth && (
                            <p id="dateOfBirth-error" className="mt-1 text-xs text-[#8B2E2E] font-medium">
                              {errors.dateOfBirth}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="gender" className={labelClass}>
                            Gender <span className="text-[#8B2E2E]">*</span>
                          </label>
                          <select
                            id="gender"
                            name="gender"
                            required
                            value={values.gender}
                            onChange={handleFieldChange}
                            aria-invalid={Boolean(errors.gender)}
                            aria-describedby={errors.gender ? 'gender-error' : undefined}
                            className={inputClass(Boolean(errors.gender))}
                          >
                            <option value="">Select gender</option>
                            {GENDER_OPTIONS.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                          {errors.gender && (
                            <p id="gender-error" className="mt-1 text-xs text-[#8B2E2E] font-medium">
                              {errors.gender}
                            </p>
                          )}
                        </div>

                        <div className="sm:col-span-2">
                          <label htmlFor="classApplyingFor" className={labelClass}>
                            Class Applying For <span className="text-[#8B2E2E]">*</span>
                          </label>
                          <select
                            id="classApplyingFor"
                            name="classApplyingFor"
                            required
                            value={values.classApplyingFor}
                            onChange={handleFieldChange}
                            aria-invalid={Boolean(errors.classApplyingFor)}
                            aria-describedby={
                              errors.classApplyingFor ? 'classApplyingFor-error' : undefined
                            }
                            className={inputClass(Boolean(errors.classApplyingFor))}
                          >
                            <option value="">Select class (Class 1 – Class 12)</option>
                            {CLASS_OPTIONS.map((cls) => (
                              <option key={cls} value={cls}>
                                {cls}
                              </option>
                            ))}
                          </select>
                          {errors.classApplyingFor && (
                            <p
                              id="classApplyingFor-error"
                              className="mt-1 text-xs text-[#8B2E2E] font-medium"
                            >
                              {errors.classApplyingFor}
                            </p>
                          )}
                        </div>
                      </div>
                    </fieldset>

                    {/* Section 2: Parent & Contact Information */}
                    <fieldset className="space-y-4">
                      <legend className="text-base font-bold font-serif text-[#34483B] border-b border-[#CFC5B1] pb-2 w-full">
                        2. Parent &amp; Contact Information
                      </legend>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                        <div>
                          <label htmlFor="fatherName" className={labelClass}>
                            Father&apos;s Name <span className="text-[#8B2E2E]">*</span>
                          </label>
                          <input
                            id="fatherName"
                            name="fatherName"
                            type="text"
                            required
                            value={values.fatherName}
                            onChange={handleFieldChange}
                            placeholder="Enter father's full name"
                            aria-invalid={Boolean(errors.fatherName)}
                            aria-describedby={errors.fatherName ? 'fatherName-error' : undefined}
                            className={inputClass(Boolean(errors.fatherName))}
                          />
                          {errors.fatherName && (
                            <p id="fatherName-error" className="mt-1 text-xs text-[#8B2E2E] font-medium">
                              {errors.fatherName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="motherName" className={labelClass}>
                            Mother&apos;s Name <span className="text-[#8B2E2E]">*</span>
                          </label>
                          <input
                            id="motherName"
                            name="motherName"
                            type="text"
                            required
                            value={values.motherName}
                            onChange={handleFieldChange}
                            placeholder="Enter mother's full name"
                            aria-invalid={Boolean(errors.motherName)}
                            aria-describedby={errors.motherName ? 'motherName-error' : undefined}
                            className={inputClass(Boolean(errors.motherName))}
                          />
                          {errors.motherName && (
                            <p id="motherName-error" className="mt-1 text-xs text-[#8B2E2E] font-medium">
                              {errors.motherName}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="contactNumber" className={labelClass}>
                            Primary Contact Number <span className="text-[#8B2E2E]">*</span>
                          </label>
                          <input
                            id="contactNumber"
                            name="contactNumber"
                            type="tel"
                            required
                            autoComplete="tel"
                            value={values.contactNumber}
                            onChange={handleFieldChange}
                            placeholder="e.g. 9876543210 or +91 98765-43210"
                            aria-invalid={Boolean(errors.contactNumber)}
                            aria-describedby={
                              errors.contactNumber ? 'contactNumber-error' : undefined
                            }
                            className={inputClass(Boolean(errors.contactNumber))}
                          />
                          {errors.contactNumber && (
                            <p
                              id="contactNumber-error"
                              className="mt-1 text-xs text-[#8B2E2E] font-medium"
                            >
                              {errors.contactNumber}
                            </p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="email" className={labelClass}>
                            Email Address <span className="text-[#55594E] font-normal">(Optional)</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            value={values.email}
                            onChange={handleFieldChange}
                            placeholder="parent@example.com"
                            aria-invalid={Boolean(errors.email)}
                            aria-describedby={errors.email ? 'email-error' : undefined}
                            className={inputClass(Boolean(errors.email))}
                          />
                          {errors.email && (
                            <p id="email-error" className="mt-1 text-xs text-[#8B2E2E] font-medium">
                              {errors.email}
                            </p>
                          )}
                        </div>
                      </div>
                    </fieldset>

                    {/* Section 3: Optional Student Photograph */}
                    <fieldset className="space-y-4">
                      <legend className="text-base font-bold font-serif text-[#34483B] border-b border-[#CFC5B1] pb-2 w-full">
                        3. Student Photograph <span className="text-xs font-sans font-normal text-[#55594E]">(Optional)</span>
                      </legend>

                      <div className="pt-1 space-y-3">
                        <label htmlFor="photo" className={labelClass}>
                          Upload Photograph (JPEG, PNG, or WebP — Max 2 MB)
                        </label>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <input
                            ref={fileInputRef}
                            id="photo"
                            name="photo"
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={handlePhotoChange}
                            aria-invalid={Boolean(errors.photo)}
                            aria-describedby={errors.photo ? 'photo-error' : undefined}
                            className="w-full text-xs sm:text-sm text-[#55594E] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-[#CFC5B1] file:text-xs file:font-semibold file:bg-[#F4EFE3] file:text-[#34483B] hover:file:bg-[#EBE2CC] cursor-pointer"
                          />
                        </div>

                        {errors.photo && (
                          <p id="photo-error" className="text-xs text-[#8B2E2E] font-medium">
                            {errors.photo}
                          </p>
                        )}

                        {photoPreviewUrl && photoFile && (
                          <div className="mt-3 p-3.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3.5 min-w-0">
                              <img
                                src={photoPreviewUrl}
                                alt="Selected student photograph preview"
                                className="w-16 h-16 object-cover rounded-sm border border-[#CFC5B1] shrink-0"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-[#34483B] truncate flex items-center gap-1.5">
                                  <FiUploadCloud className="text-[#AD8746] shrink-0" />
                                  <span className="truncate">{photoFile.name}</span>
                                </p>
                                <p className="text-[11px] text-[#55594E] mt-0.5">
                                  {(photoFile.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={handleRemovePhoto}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-[#8B2E2E]/40 text-[#8B2E2E] hover:bg-[#8B2E2E]/10 text-xs font-semibold transition-colors shrink-0"
                            >
                              <FiTrash2 />
                              <span>Remove</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </fieldset>

                    <div className="pt-2 border-t border-[#CFC5B1] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <p className="text-xs text-[#55594E]">
                        By submitting, you confirm that the entered details are accurate for
                        school verification.
                      </p>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full sm:w-auto px-7 py-3 rounded-sm bg-[#34483B] hover:bg-[#27372D] disabled:opacity-60 disabled:cursor-not-allowed text-[#F4EFE3] font-semibold text-sm tracking-wide transition-colors inline-flex items-center justify-center gap-2 shrink-0"
                      >
                        <FiSend className="text-[#AD8746]" />
                        <span>{submitting ? 'Submitting Application...' : 'Submit Registration'}</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default StudentRegistration;
