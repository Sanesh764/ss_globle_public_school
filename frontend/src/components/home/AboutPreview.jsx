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
    <section className="py-20 bg-slate-900 text-white border-t border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Image Section (Framed with Soft Hover Zoom & Non-Overlapping Stats Row) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="group rounded-3xl overflow-hidden shadow-xl border border-slate-700/80 relative bg-slate-950">
              <img
                src={aboutImage}
                alt="S.S. Global Public School Building"
                width="600"
                height="380"
                loading="lazy"
                decoding="async"
                className="w-full h-[360px] sm:h-[400px] object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* Clean Non-Overlapping Statistics Row Below Image */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl text-center shadow-md">
                <span className="text-xl sm:text-2xl font-extrabold font-serif text-amber-400 block">{expNumber}</span>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mt-0.5">Excellence</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl text-center shadow-md">
                <span className="text-xl sm:text-2xl font-extrabold font-serif text-blue-400 block">1,200+</span>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mt-0.5">Students</span>
              </div>
              <div className="bg-slate-800/80 border border-slate-700/80 p-4 rounded-2xl text-center shadow-md">
                <span className="text-xl sm:text-2xl font-extrabold font-serif text-emerald-400 block">CBSE</span>
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mt-0.5">Affiliated</span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
              {aboutBadge}
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white leading-tight tracking-tight">
              {aboutTitle}
            </h2>
            <p className="text-slate-300 text-base leading-relaxed max-w-xl">
              {aboutText}
            </p>

            {/* Feature List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {features.map((pt, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/40 transition-colors flex items-center gap-2.5 text-xs sm:text-sm text-slate-200 font-medium"
                >
                  <FiCheckCircle className="text-blue-400 text-base shrink-0" />
                  <span>{pt}</span>
                </div>
              ))}
            </div>

            {/* Call To Action Premium Button */}
            <div className="pt-4">
              <Link
                to={buttonLink}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 group"
              >
                {buttonText} <FiArrowRight className="text-base transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutPreview;
