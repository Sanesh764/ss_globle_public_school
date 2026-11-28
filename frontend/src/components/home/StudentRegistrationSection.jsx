import React from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiFileText, FiCheckCircle } from 'react-icons/fi';

const STUDENT_REGISTRATION_SECTION_CONTENT = {
  eyebrow: 'Online Student Registration',
  heading: 'Student Registration Made Easy',
  description:
    'Looking to join S.S. Global Public School? Fill in the student details through our online registration form and submit your application for admission.',
  ctaLabel: 'Fill Student Details',
  ctaPath: '/register',
  supportingText: 'Complete the online form to begin your admission process.',
};

const StudentRegistrationSection = () => {
  return (
    <section
      id="student-registration"
      aria-labelledby="student-registration-heading"
      className="py-12 sm:py-16 bg-[#F4EFE3] border-b border-[#CFC5B1]"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-[#CFC5B1] rounded-sm shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          {/* Left Content Column */}
          <div className="lg:col-span-8 p-6 sm:p-8 lg:p-10 space-y-4">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>{STUDENT_REGISTRATION_SECTION_CONTENT.eyebrow}</span>
            </div>

            <h2
              id="student-registration-heading"
              className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-[#34483B] leading-tight"
            >
              {STUDENT_REGISTRATION_SECTION_CONTENT.heading}
            </h2>

            <p className="text-sm sm:text-base text-[#55594E] leading-relaxed max-w-2xl">
              {STUDENT_REGISTRATION_SECTION_CONTENT.description}
            </p>

            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs font-medium text-[#34483B]">
              <span className="inline-flex items-center gap-1.5">
                <FiCheckCircle className="text-[#AD8746] shrink-0" />
                <span>Classes 1 to 12</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiCheckCircle className="text-[#AD8746] shrink-0" />
                <span>Simple Online Form</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <FiCheckCircle className="text-[#AD8746] shrink-0" />
                <span>Application Number Generated</span>
              </span>
            </div>
          </div>

          {/* Right CTA Column */}
          <div className="lg:col-span-4 bg-[#34483B] text-[#F4EFE3] p-6 sm:p-8 lg:p-10 flex flex-col justify-center gap-4 border-t lg:border-t-0 lg:border-l border-[#27372D]">
            <div className="w-11 h-11 rounded-sm bg-[#27372D] border border-[#AD8746]/50 text-[#AD8746] flex items-center justify-center text-xl">
              <FiFileText />
            </div>

            <p className="text-sm text-[#EBE2CC]/90 leading-relaxed">
              {STUDENT_REGISTRATION_SECTION_CONTENT.supportingText}
            </p>

            <Link
              to={STUDENT_REGISTRATION_SECTION_CONTENT.ctaPath}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-sm bg-[#AD8746] hover:bg-[#8E6D35] text-white font-semibold text-sm tracking-wide transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F4EFE3] focus-visible:ring-offset-2 focus-visible:ring-offset-[#34483B]"
            >
              <span>{STUDENT_REGISTRATION_SECTION_CONTENT.ctaLabel}</span>
              <FiArrowRight />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default StudentRegistrationSection;
