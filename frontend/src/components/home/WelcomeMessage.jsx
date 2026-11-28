import React from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getPublicLeadershipApi } from '../../services/leadershipService';
import { getImageUrl } from '../../services/api';
import { LEADERSHIP_FALLBACK } from '../../config/fallbackData';
import { FaQuoteLeft } from 'react-icons/fa';
import { FiMapPin } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';

const WelcomeMessage = () => {
  const { data, loading, error } = useFetch(() => getPublicLeadershipApi(), []);

  let leaders = [];

  if (error) {
    leaders = LEADERSHIP_FALLBACK;
  } else if (data) {
    const apiList = data?.data || data?.leadership || (Array.isArray(data) ? data : null);
    if (Array.isArray(apiList)) {
      leaders = apiList.length > 0 ? apiList : [];
    } else {
      leaders = LEADERSHIP_FALLBACK;
    }
  }

  return (
    <section className="py-16 sm:py-20 bg-[#F4EFE3] text-[#252821] border-b border-[#CFC5B1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
            <span className="w-6 h-[1.5px] bg-[#AD8746]" />
            <span>School Leadership &amp; Vision</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] tracking-tight leading-tight">
            Messages From Our Leadership
          </h2>
          <p className="text-[#55594E] text-sm sm:text-base leading-relaxed">
            Guided by visionary founders and experienced academic leaders dedicated to nurturing academic excellence, moral integrity, and holistic personality development.
          </p>
        </div>

        {loading ? (
          <div className="min-h-[280px] flex items-center justify-center">
            <LoadingSpinner text="Loading Leadership..." />
          </div>
        ) : leaders.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 items-stretch">
            {leaders.map((leader, idx) => {
              const imageSrc = getImageUrl(leader.image);

              return (
                <article
                  key={leader._id || idx}
                  className="bg-[#EBE2CC]/55 border border-[#CFC5B1] hover:border-[#AD8746] rounded-sm p-6 sm:p-7 flex flex-col justify-between transition-colors duration-200"
                >
                  <div className="space-y-5 flex-1 flex flex-col">
                    {/* Portrait & Identity */}
                    <div className="flex items-center gap-4 pb-5 border-b border-[#CFC5B1]">
                      <div className="w-20 h-20 rounded-sm border border-[#CFC5B1] bg-[#F4EFE3] p-1 shrink-0 overflow-hidden">
                        <img
                          src={imageSrc}
                          alt={leader.name}
                          width="80"
                          height="80"
                          loading="lazy"
                          decoding="async"
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#AD8746] block">
                          {leader.designation}
                        </span>
                        <h3 className="text-lg font-bold font-serif text-[#34483B] leading-snug mt-0.5">
                          {leader.name}
                        </h3>
                        <span className="text-xs text-[#55594E] flex items-center gap-1 mt-1">
                          <FiMapPin className="text-[#AD8746] shrink-0 text-[11px]" />
                          <span>{leader.location || 'Daudnagar, Bihar'}</span>
                        </span>
                      </div>
                    </div>

                    {/* Heading / Address Title */}
                    {leader.heading && (
                      <h4 className="text-sm font-semibold font-serif italic text-[#34483B] leading-snug">
                        “{leader.heading}”
                      </h4>
                    )}

                    {/* Message Body */}
                    <div className="flex-1 flex flex-col justify-between space-y-4 relative">
                      <div className="relative">
                        <FaQuoteLeft className="text-[#CFC5B1] text-xl mb-2" />
                        <p className="text-xs sm:text-sm text-[#252821] leading-relaxed">
                          {leader.message}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#CFC5B1] flex items-center justify-between text-[11px] text-[#55594E]">
                        <span className="font-serif italic font-semibold text-[#34483B]">{leader.name}</span>
                        <span className="uppercase tracking-wider text-[10px]">S.S. Global</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm">
            No leadership messages available at this time.
          </div>
        )}
      </div>
    </section>
  );
};

export default WelcomeMessage;
