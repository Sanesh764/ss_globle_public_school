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
    },
    {
      id: 'cultural-celebration',
      title: 'Cultural Celebration',
      subtitle: 'Celebrating Student Talent',
      description: "Showcasing patriotic songs, dance performances, and speeches honoring India's rich heritage and freedom fighters.",
      icon: FiHeart,
    },
    {
      id: 'young-india',
      title: 'Young India & Futures',
      subtitle: 'Inspiring Stronger Tomorrow',
      description: 'Empowering students with quality education, values, and vision to contribute towards a progressive nation.',
      icon: FiTrendingUp,
    },
  ];

  return (
    <section className="relative bg-[#34483B] text-[#F4EFE3] py-12 sm:py-16 border-y border-[#AD8746]/50 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-sm bg-[#27372D] border border-[#AD8746]/60 text-[#EBE2CC] text-xs font-semibold uppercase tracking-widest">
            <span>🇮🇳 Our Freedom, Our Responsibility</span>
          </div>

          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold font-serif text-[#F4EFE3] tracking-tight leading-tight">
            Education is the Foundation of a{' '}
            <span className="italic text-[#AD8746]">Stronger and Better India</span>
          </h2>

          <p className="text-xs sm:text-sm text-[#EBE2CC]/85 max-w-xl mx-auto leading-relaxed">
            S.S. Global Public School, Daudnagar salutes the heroes of our nation and reaffirms our commitment to empowering future leaders.
          </p>

          <div className="pt-1">
            <span className="inline-block text-[11px] font-semibold text-[#AD8746] uppercase tracking-[0.18em] border-b border-[#AD8746]/50 pb-1">
              15 August 2026 Celebration
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#27372D] border border-[#4B6353] hover:border-[#AD8746] p-6 rounded-sm transition-colors flex flex-col justify-between space-y-5"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-sm border border-[#AD8746]/50 bg-[#34483B] text-[#AD8746] flex items-center justify-center shrink-0">
                    <Icon className="text-lg" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold font-serif text-[#F4EFE3]">
                      {item.title}
                    </h3>
                    <span className="text-[11px] font-semibold text-[#AD8746] uppercase tracking-wider block mt-0.5">
                      {item.subtitle}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-[#EBE2CC]/85 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#3F5547] flex items-center justify-between">
                  <span className="text-[11px] font-medium text-[#EBE2CC]/70">S.S. Global Celebration</span>
                  <Link
                    to="/gallery"
                    className="text-xs font-semibold text-[#AD8746] hover:text-[#F4EFE3] inline-flex items-center gap-1 transition-colors"
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
