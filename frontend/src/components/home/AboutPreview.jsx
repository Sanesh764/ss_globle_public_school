import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiCheck, FiArrowRight } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';
import { getImageUrl } from '../../services/api';

const AboutPreview = () => {
  const { settings } = useContext(SettingContext);

  const aboutBadge = settings.aboutBadge || 'About Our Institution';
  const aboutTitle =
    settings.aboutTitle || `Shaping Future Leaders at ${settings.schoolName || 'S.S. Global Public School'}`;
  const aboutText =
    settings.aboutText1 ||
    settings.aboutText ||
    settings.about ||
    'Situated in Daudnagar, Bihar, S.S. Global Public School is committed to delivering holistic education that blends academic rigour, technological fluency, and character building.';
  const aboutImage = getImageUrl(settings.aboutImage || settings.heroImage || '/school.webp');
  const expNumber = settings.aboutExpNumber || '15+';
  const buttonText = settings.aboutButtonText || 'Learn More About Our Mission & Leadership';
  const buttonLink = settings.aboutButtonLink || '/about';

  const defaultFeatures = [
    'Affiliated & aligned with CBSE Academic Standards',
    'Interactive Smart Classrooms & Digital Learning',
    'Comprehensive Science & Robotics Laboratories',
    'Safe CCTV-Monitored Transport System in Daudnagar',
    'Dedicated Focus on Sports & Holistic Personality Development',
    'Individual Attention under Principal Leadership',
  ];

  const features =
    Array.isArray(settings.aboutFeaturesList) && settings.aboutFeaturesList.length > 0
      ? settings.aboutFeaturesList.map((f) => (typeof f === 'object' ? f.title : f))
      : Array.isArray(settings.aboutFeatures) && settings.aboutFeatures.length > 0
        ? settings.aboutFeatures
        : defaultFeatures;

  return (
    <section className="py-16 sm:py-20 bg-[#EBE2CC] text-[#252821] border-b border-[#CFC5B1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          {/* Image & Key Metrics Column */}
          <div className="lg:col-span-6 space-y-5">
            <div className="bg-[#F4EFE3] p-2.5 rounded-sm border border-[#CFC5B1] overflow-hidden">
              <div className="overflow-hidden rounded-xs">
                <img
                  src={aboutImage}
                  alt="S.S. Global Public School Building"
                  width="600"
                  height="380"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-[320px] sm:h-[400px] object-cover hover:scale-[1.02] transition-transform duration-500"
                />
              </div>
            </div>

            {/* Clean Architectural Metrics Strip */}
            <div className="grid grid-cols-3 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm divide-x divide-[#CFC5B1]">
              <div className="py-4 px-3 text-center">
                <span className="text-xl sm:text-2xl font-bold font-serif text-[#34483B] block">{expNumber}</span>
                <span className="text-[10px] font-semibold text-[#AD8746] uppercase tracking-[0.14em] block mt-0.5">
                  Years Excellence
                </span>
              </div>
              <div className="py-4 px-3 text-center">
                <span className="text-xl sm:text-2xl font-bold font-serif text-[#34483B] block">1,200+</span>
                <span className="text-[10px] font-semibold text-[#AD8746] uppercase tracking-[0.14em] block mt-0.5">
                  Students
                </span>
              </div>
              <div className="py-4 px-3 text-center">
                <span className="text-xl sm:text-2xl font-bold font-serif text-[#34483B] block">CBSE</span>
                <span className="text-[10px] font-semibold text-[#AD8746] uppercase tracking-[0.14em] block mt-0.5">
                  Curriculum
                </span>
              </div>
            </div>
          </div>

          {/* Editorial Content Column */}
          <div className="lg:col-span-6 space-y-6">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
                <span className="w-6 h-[1.5px] bg-[#AD8746]" />
                <span>{aboutBadge}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] leading-tight tracking-tight">
                {aboutTitle}
              </h2>
              <p className="text-[#55594E] text-sm sm:text-base leading-relaxed">
                {aboutText}
              </p>
            </div>

            {/* Ruled Feature Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 pt-2 border-t border-[#CFC5B1]">
              {features.map((pt, idx) => (
                <div
                  key={idx}
                  className="py-2 border-b border-[#CFC5B1]/70 flex items-start gap-2.5 text-xs sm:text-sm text-[#252821] font-medium"
                >
                  <FiCheck className="text-[#34483B] text-sm shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* Action Link */}
            <div className="pt-2">
              <Link
                to={buttonLink}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm tracking-wide transition-colors group"
              >
                <span>{buttonText}</span>
                <FiArrowRight className="text-[#AD8746] transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
