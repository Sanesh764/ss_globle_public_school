import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCheckCircle, FiAward, FiBookOpen, FiUsers } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';

const HeroSection = () => {
  const { settings } = useContext(SettingContext);

  const heroBg = settings.heroImage || '/school.jpg';

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-slate-950 text-white">
      {/* Background Image with Dark Overlay Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 ease-out"
        style={{
          backgroundImage: `url('${heroBg}')`,
        }}
      ></div>

      <div className="absolute inset-0 hero-gradient"></div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-3xl space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold backdrop-blur-md">
            <FiCheckCircle className="text-amber-400 text-base" /> Admissions Open for Academic Session 2026-2027
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-serif leading-tight text-white tracking-tight">
            Welcome to <br />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              {settings.schoolName || 'S.S. Global Public School'}
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-200 font-light leading-relaxed">
            Located in <span className="text-amber-300 font-semibold">Daudnagar, Bihar</span>. We provide premier CBSE curriculum education, smart classrooms, state-of-the-art computer & science laboratories, and comprehensive character building under Principal <span className="text-amber-300 font-semibold">{settings.principalName || 'Manish Singh'}</span>.
          </p>

          {/* Action Buttons */}
          <div className="pt-4 flex flex-wrap gap-4 items-center">
            <Link
              to="/contact"
              className="px-7 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-1 flex items-center gap-2 group"
            >
              Apply For Admission <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/about"
              className="px-7 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-base backdrop-blur-md border border-white/20 transition-all hover:border-white/40"
            >
              Explore School Vision
            </Link>
          </div>

          {/* Key Feature Bullets */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-white/10 text-xs sm:text-sm text-slate-300">
            <div className="flex items-center gap-2">
              <FiAward className="text-amber-400 text-lg" /> 100% CBSE Curriculum
            </div>
            <div className="flex items-center gap-2">
              <FiBookOpen className="text-blue-400 text-lg" /> Smart Classrooms
            </div>
            <div className="flex items-center gap-2">
              <FiUsers className="text-emerald-400 text-lg" /> Experienced Faculty
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Bottom Wave */}
      <div className="absolute bottom-0 inset-x-0 h-10 bg-slate-50 [clip-path:polygon(0_100%,100%_100%,100%_0)]"></div>
    </div>
  );
};

export default HeroSection;
