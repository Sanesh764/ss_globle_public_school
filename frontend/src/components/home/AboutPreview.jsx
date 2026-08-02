import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import { SettingContext } from '../../context/SettingContext';
import { getImageUrl } from '../../services/api';

const AboutPreview = () => {
  const { settings } = useContext(SettingContext);

  const aboutBadge = settings.aboutBadge || 'ABOUT OUR INSTITUTION';
  const aboutTitle = settings.aboutTitle || `Shaping Future Leaders at ${settings.schoolName || 'S.S. Global Public School'}`;
  const aboutText = settings.aboutText1 || settings.aboutText || settings.about || 'Situated in Daudnagar, Bihar, S.S. Global Public School is committed to delivering holistic education that blends academic rigour, technological fluency, and character building.';
  const aboutImage = getImageUrl(settings.aboutImage || settings.heroImage || '/school.webp');
  const expNumber = settings.aboutExpNumber || '15+';
  const expText = settings.aboutExpText || 'Years of Educational Excellence';
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

  const features = Array.isArray(settings.aboutFeaturesList) && settings.aboutFeaturesList.length > 0
    ? settings.aboutFeaturesList.map((f) => (typeof f === 'object' ? f.title : f))
    : (Array.isArray(settings.aboutFeatures) && settings.aboutFeatures.length > 0 ? settings.aboutFeatures : defaultFeatures);

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image Collage */}
          <div className="lg:col-span-6 relative">
            <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100">
              <img
                src={aboutImage}
                alt="S.S. Global Public School Building"
                width="600"
                height="380"
                loading="lazy"
                decoding="async"
                className="w-full h-[380px] object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Overlay badge */}
            <div className="absolute -bottom-6 right-2 sm:right-6 z-20 bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-700 max-w-xs">
              <span className="text-3xl font-extrabold text-amber-400 font-serif block">{expNumber}</span>
              <span className="text-xs text-slate-300 font-medium uppercase tracking-wider block">{expText}</span>
            </div>
          </div>

          {/* Text Content */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-block px-3.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
              {aboutBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 leading-tight">
              {aboutTitle}
            </h2>
            <p className="text-slate-600 text-base leading-relaxed">
              {aboutText}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {features.map((pt, idx) => (
                <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                  <FiCheckCircle className="text-blue-600 text-lg shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            <div className="pt-4">
              <Link
                to={buttonLink}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-base hover:underline"
              >
                {buttonText} <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
