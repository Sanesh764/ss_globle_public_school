import React, { useContext } from 'react';
import { SettingContext } from '../../context/SettingContext';
import { FaQuoteLeft } from 'react-icons/fa';

const WelcomeMessage = () => {
  const { settings } = useContext(SettingContext);

  const principalPhoto = settings.principalPhoto || '/principle.png';
  const principalName = settings.principalName || 'Manish Singh';

  return (
    <section className="py-16 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -z-0"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Principal Photo & Details */}
            <div className="lg:col-span-4 flex flex-col items-center text-center">
              <div className="w-44 h-44 sm:w-52 sm:h-52 rounded-full p-2 bg-gradient-to-tr from-blue-600 to-amber-400 shadow-xl mb-4 overflow-hidden">
                <img
                  src={principalPhoto && principalPhoto !== '/principle.png' ? principalPhoto : '/principle.webp'}
                  alt={`Principal ${principalName}`}
                  width="208"
                  height="208"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full bg-slate-100"
                />
              </div>
              <h3 className="text-xl font-bold text-slate-900 font-serif">
                {principalName}
              </h3>
              <p className="text-sm font-semibold text-blue-600">Principal, S.S. Global Public School</p>
              <span className="mt-1 text-xs text-slate-500 font-medium">Daudnagar, Bihar</span>
            </div>

            {/* Principal Message Text */}
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 text-amber-500 font-bold text-sm uppercase tracking-wider">
                <FaQuoteLeft className="text-2xl" /> Principal's Address
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 leading-snug">
                Building Strong Foundations for a Brighter Tomorrow
              </h2>
              <p className="text-slate-600 leading-relaxed text-base italic bg-slate-50 p-6 rounded-2xl border border-slate-200">
                "{settings.principalMessage || 'Welcome to S.S. Global Public School. Education is not merely the accumulation of facts, but the training of the mind to think, innovate, and lead with empathy. We strive to provide every student in Daudnagar with world-class facilities and moral values.'}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeMessage;
