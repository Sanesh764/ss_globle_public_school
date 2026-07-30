import React, { useContext } from 'react';
import { useFetch } from '../../hooks/useFetch';
import { getPublicLeadershipApi } from '../../services/leadershipService';
import { getImageUrl } from '../../services/api';
import { SettingContext } from '../../context/SettingContext';
import { FaQuoteLeft } from 'react-icons/fa';
import { FiMapPin, FiAward } from 'react-icons/fi';
import LoadingSpinner from '../common/LoadingSpinner';

const WelcomeMessage = () => {
  const { data, loading } = useFetch(() => getPublicLeadershipApi(), []);
  const { settings } = useContext(SettingContext);

  const defaultLeaders = [
    {
      _id: 'default-1',
      name: settings?.directorName || 'Er. R. P. Singh (B.Tech)',
      designation: 'Founder & Director',
      heading: 'Empowering Future Leaders & Innovators',
      message: settings?.directorMessage || 'Our vision is to provide world-class CBSE education in Daudnagar. We empower students with critical thinking, sportsmanship, technological literacy, and strong moral grounding.',
      location: 'Daudnagar, Bihar',
      image: settings?.directorPhoto || '/school.webp',
    },
    {
      _id: 'default-2',
      name: settings?.principalName || 'Manish Singh',
      designation: 'Principal',
      heading: 'Building Strong Foundations for Tomorrow',
      message: settings?.principalMessage || 'Welcome to S.S. Global Public School. Education is not merely the accumulation of facts, but the training of the mind to think, innovate, and lead with empathy. We strive for excellence.',
      location: 'Daudnagar, Bihar',
      image: settings?.principalPhoto || '/principle.webp',
    },
  ];

  const leaders = data?.data && Array.isArray(data.data) && data.data.length > 0 ? data.data : defaultLeaders;

  return (
    <section className="py-20 bg-slate-50 border-y border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider border border-blue-200">
            <FiAward className="text-amber-500 text-base" /> School Leadership & Vision
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-slate-900 tracking-tight">
            Messages From Our Leadership
          </h2>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Guided by visionary founders and experienced academic leaders dedicated to nurturing academic excellence, moral integrity, and holistic personality development.
          </p>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : (
          /* Responsive Card Grid: 3 Desktop | 2 Tablet | 1 Mobile */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch">
            {leaders.map((leader, idx) => {
              const imageSrc = getImageUrl(leader.image);

              return (
                <div
                  key={leader._id || idx}
                  className="bg-white rounded-3xl p-7 shadow-lg hover:shadow-2xl transition-all duration-300 border border-slate-200/90 flex flex-col justify-between card-hover relative overflow-hidden group"
                >
                  {/* Subtle Top Accent Bar */}
                  <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-sky-400 group-hover:h-2 transition-all"></div>

                  <div className="space-y-5 flex-1 flex flex-col">
                    {/* Header: Circular Profile Image & Designation */}
                    <div className="flex flex-col items-center text-center space-y-3 pt-2">
                      <div className="relative">
                        <div className="w-32 h-32 sm:w-36 sm:h-36 rounded-full p-1.5 bg-gradient-to-tr from-blue-600 via-amber-400 to-sky-400 shadow-xl overflow-hidden group-hover:scale-105 transition-transform duration-300">
                          <img
                            src={imageSrc}
                            alt={leader.name}
                            width="144"
                            height="144"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full object-cover rounded-full bg-slate-100"
                          />
                        </div>
                      </div>

                      <div>
                        <span className="inline-block bg-amber-400/20 text-amber-800 border border-amber-400/40 text-[11px] font-extrabold uppercase px-3 py-1 rounded-full tracking-wider mb-1.5">
                          {leader.designation}
                        </span>
                        <h3 className="text-xl font-bold font-serif text-slate-900 block group-hover:text-blue-600 transition-colors">
                          {leader.name}
                        </h3>
                        <span className="text-xs text-slate-500 font-medium flex items-center justify-center gap-1 mt-0.5">
                          <FiMapPin className="text-amber-500" /> {leader.location || 'Daudnagar, Bihar'}
                        </span>
                      </div>
                    </div>

                    {/* Heading / Address Title */}
                    {leader.heading && (
                      <div className="text-center pt-1 border-t border-slate-100">
                        <h4 className="text-sm font-bold font-serif text-slate-800 leading-snug">
                          "{leader.heading}"
                        </h4>
                      </div>
                    )}

                    {/* Detailed Message Block */}
                    <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex-1 flex flex-col justify-between space-y-2 relative">
                      <FaQuoteLeft className="text-blue-200 text-2xl absolute top-3 left-3 opacity-40" />
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic relative z-10 pl-3">
                        "{leader.message}"
                      </p>

                      {/* Signature Style Footer */}
                      <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-400 font-medium">
                        <span className="font-serif italic font-bold text-slate-700">{leader.name}</span>
                        <span>S.S. Global</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default WelcomeMessage;
