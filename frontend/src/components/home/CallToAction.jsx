import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPhoneCall } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';

const CallToAction = () => {
  const { settings } = useContext(SettingContext);

  return (
    <section className="py-16 sm:py-20 bg-[#34483B] text-[#F4EFE3] border-b border-[#27372D]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#AD8746]">
          <span className="w-6 h-[1.5px] bg-[#AD8746]" />
          <span>Admission Session 2026–2027 Open</span>
          <span className="w-6 h-[1.5px] bg-[#AD8746]" />
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif leading-tight text-[#F4EFE3]">
          Give Your Child The Foundation of Quality CBSE Education
        </h2>

        <p className="text-[#EBE2CC]/85 max-w-2xl mx-auto text-sm sm:text-base leading-relaxed">
          Enroll your child at {settings.schoolName || 'S.S. Global Public School'}, Daudnagar. Experience interactive digital learning, modern laboratories, and dedicated mentorship.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-3">
          <Link
            to="/contact"
            className="px-7 py-3.5 rounded-sm bg-[#AD8746] hover:bg-[#8E6D35] text-white font-semibold text-sm tracking-wide transition-colors flex items-center gap-2"
          >
            <span>Apply Online / Contact Office</span>
            <FiArrowRight />
          </Link>
          <a
            href={`tel:${settings.phone || '+919122490003'}`}
            className="px-7 py-3.5 rounded-sm bg-[#27372D] hover:bg-[#1E2B23] text-[#F4EFE3] font-semibold text-sm tracking-wide border border-[#4B6353] transition-colors flex items-center justify-center gap-2"
          >
            <FiPhoneCall className="text-[#AD8746]" />
            <span>Call {settings.phone || '+91 9122490003'}</span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
