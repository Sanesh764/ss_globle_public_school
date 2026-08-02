import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getPublicLeadershipApi } from '../../services/leadershipService';
import { getImageUrl } from '../../services/api';
import { LEADERSHIP_FALLBACK } from '../../config/fallbackData';
import { FaQuoteLeft } from 'react-icons/fa';
import { FiMapPin, FiAward } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';

const WelcomeMessage = () => {
  const { data, loading, error } = useFetch(() => getPublicLeadershipApi(), []);

  // Determine leaders list based on response classification:
  // 1. API Failure -> use LEADERSHIP_FALLBACK
  // 2. API Success + Data -> use API data
  // 3. API Success + Empty -> empty array
  let leaders = [];
  let isApiFailed = false;

  if (error) {
    leaders = LEADERSHIP_FALLBACK;
    isApiFailed = true;
  } else if (data) {
    const apiList = data?.data || data?.leadership || (Array.isArray(data) ? data : null);
    if (Array.isArray(apiList)) {
      leaders = apiList.length > 0 ? apiList : [];
    } else {
      leaders = LEADERSHIP_FALLBACK;
    }
  }

  return (
    <section className="py-20 bg-slate-950 text-white border-y border-slate-800/80 relative overflow-hidden">
      {/* Background Decorative Glow */}
      <div className="absolute top-1/4 left-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30 backdrop-blur-sm">
            <FiAward className="text-amber-400 text-base" /> School Leadership & Vision
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-white tracking-tight">
            Messages From Our Leadership
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Guided by visionary founders and experienced academic leaders dedicated to nurturing academic excellence, moral integrity, and holistic personality development.
          </p>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : leaders.length > 0 ? (
          /* Responsive Card Grid: 3 Desktop | 2 Tablet | 1 Mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {leaders.map((leader, idx) => {
              const imageSrc = getImageUrl(leader.image);

              return (
                <div
                  key={leader._id || idx}
                  className="glass-card rounded-3xl p-7 shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-800 flex flex-col justify-between card-hover relative overflow-hidden group"
                >
                  {/* Subtle Top Accent Bar */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-sky-400 group-hover:h-2 transition-all"></div>

                  <div className="space-y-5 flex-1 flex flex-col">
                    {/* Header: Circular Profile Image & Designation */}
                    <div className="flex flex-col items-center text-center space-y-3 pt-2">
                      <div className="relative">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-tr from-blue-600 via-amber-400 to-sky-400 shadow-xl shadow-blue-900/30 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={imageSrc}
                            alt={leader.name}
                            width="144"
                            height="144"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover rounded-full bg-slate-900"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="inline-block bg-amber-400/20 text-amber-300 border border-amber-400/40 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-1.5">
                          {leader.designation}
                        </span>
                        <h3 className="text-xl font-bold font-serif text-white block group-hover:text-blue-400 transition-colors">
                          {leader.name}
                        </h3>
                        <span className="text-xs text-slate-400 font-medium flex items-center justify-center gap-1 mt-0.5">
                          <FiMapPin className="text-amber-400" /> {leader.location || 'Daudnagar, Bihar'}
                        </span>
                      </div>
                    </div>

                    {/* Heading / Address Title */}
                    {leader.heading && (
                      <div className="text-center pt-1 border-t border-slate-800">
                        <h4 className="text-sm font-bold font-serif text-amber-200 leading-snug">
                          "{leader.heading}"
                        </h4>
                      </div>
                    )}

                    {/* Detailed Message Block */}
                    <div className="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 flex-1 flex flex-col justify-between space-y-2 relative">
                      <FaQuoteLeft className="text-blue-400/20 text-2xl absolute top-3 left-3 opacity-40" />
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed italic relative z-10 pl-3">
                        "{leader.message}"
                      </p>

                      {/* Signature Style Footer */}
                      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span className="font-serif italic font-bold text-amber-400">{leader.name}</span>
                        <span>S.S. Global</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-900 rounded-2xl border border-slate-800 text-slate-400">
            No leadership messages available at this time.
          </div>
        )}
      </div>
    </section>
  );
};

export default WelcomeMessage;
