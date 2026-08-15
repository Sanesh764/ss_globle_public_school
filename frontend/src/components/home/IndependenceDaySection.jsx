import React from 'react';
import { Link } from 'react-router-dom';
import { FiFlag, FiHeart, FiTrendingUp, FiArrowRight } from 'react-icons/fi';
import { isIndependenceDay2026 } from '../../utils/formatDate';

const IndependenceDaySection = () => {
  if (!isIndependenceDay2026()) {
    return null;
  }

  const highlights = [
    {
      id: 'flag-hoisting',
      title: 'Flag Hoisting & Honour',
      subtitle: 'Respecting the National Flag',
      description: 'Honouring national pride through disciplined morning assembly, flag hoisting, and national anthem.',
      icon: FiFlag,
      accentColor: 'border-orange-500/40 text-orange-400 bg-orange-500/10',
    },
    {
      id: 'cultural-celebration',
      title: 'Cultural Celebration',
      subtitle: 'Celebrating Student Talent',
      description: 'Showcasing patriotic songs, dance performances, and speeches honoring India\'s rich heritage and freedom fighters.',
      icon: FiHeart,
      accentColor: 'border-amber-400/40 text-amber-300 bg-amber-400/10',
    },
    {
      id: 'young-india',
      title: 'Young India & Futures',
      subtitle: 'Inspiring Stronger Tomorrow',
      description: 'Empowering students with quality education, values, and vision to contribute towards a progressive nation.',
      icon: FiTrendingUp,
      accentColor: 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10',
    },
  ];

  return (
    <section className="relative bg-slate-950 text-white py-10 sm:py-14 border-y border-amber-500/30 overflow-hidden font-sans">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500 via-white to-emerald-500 opacity-90" />
      <div className="absolute -left-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-amber-400/40 text-amber-300 text-xs font-bold uppercase tracking-wider shadow-md">
            <span>🇮🇳 OUR FREEDOM, OUR RESPONSIBILITY</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-serif text-white tracking-tight leading-tight">
            Education is the Foundation of a <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-orange-400 via-amber-200 to-emerald-400 bg-clip-text text-transparent">
              Stronger and Better India
            </span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto">
            S.S. Global Public School, Daudnagar salutes the heroes of our nation and reaffirms our commitment to empowering future leaders.
          </p>

          <div className="pt-1">
            <span className="inline-block text-xs font-bold font-serif text-amber-400 uppercase tracking-widest bg-amber-400/10 px-4 py-1.5 rounded-full border border-amber-400/30">
              15 August 2026 Celebration
            </span>
          </div>
        </div>

        {/* 3 Highlight Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-slate-900/90 backdrop-blur-md border border-slate-800 hover:border-amber-400/40 p-6 rounded-2xl shadow-xl transition-all duration-300 flex flex-col justify-between space-y-4 group card-hover"
              >
                <div className="space-y-3">
                  <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${item.accentColor}`}>
                    <Icon className="text-xl" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-serif text-white group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-amber-400/90 uppercase tracking-wider block mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {item.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-slate-400">S.S. Global Celebration</span>
                  <Link
                    to="/gallery"
                    className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>View Gallery</span>
                    <FiArrowRight className="text-xs" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default IndependenceDaySection;
