import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiPhoneCall, FiCheckCircle } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';

const CallToAction = () => {
  const { settings } = useContext(SettingContext);

  return (
    <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-900/60 to-amber-900/40 opacity-80"></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-400/20 text-amber-300 font-bold text-xs uppercase tracking-wider border border-amber-400/30">
          <FiCheckCircle /> Admission Session 2026-2027 Open
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif leading-tight">
          Give Your Child The Gift Of Quality CBSE Education
        </h2>

        <p className="text-slate-300 max-w-2xl mx-auto text-base sm:text-lg font-light">
          Enroll your child at {settings.schoolName || 'S.S. Global Public School'}, Daudnagar. Experience interactive digital learning, modern labs, and caring guidance.
        </p>

        <div className="flex flex-wrap justify-center items-center gap-4 pt-4">
          <Link
            to="/contact"
            className="px-8 py-4 rounded-xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-extrabold text-base shadow-xl shadow-amber-400/20 transition-all transform hover:-translate-y-1 flex items-center gap-2"
          >
            Apply Online / Contact Office <FiArrowRight />
          </Link>
          <a
            href={`tel:${settings.phone || '+919122490003'}`}
            className="px-8 py-4 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-white font-bold text-base border border-slate-700 shadow-xl transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2 group"
          >
            <FiPhoneCall className="text-amber-400" /> Call {settings.phone || '+91 9122490003'}
          </a>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
