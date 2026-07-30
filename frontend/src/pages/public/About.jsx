import React, { useContext } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { SettingContext } from '../../context/SettingContext';
import { getImageUrl } from '../../services/api';
import { FiEye, FiTarget, FiHeart, FiAward, FiShield, FiBookOpen, FiCheckCircle } from 'react-icons/fi';

const About = () => {
  const { settings } = useContext(SettingContext);

  const heroTitle = settings.aboutHeroTitle || 'About S.S. Global Public School';
  const heroSubtitle = settings.aboutHeroSubtitle || 'Dedicated to excellence in education, character building, and leadership in Daudnagar, Bihar.';
  const aboutBadge = settings.aboutBadge || 'Our Legacy & History';
  const aboutTitle = settings.aboutTitle || 'Nurturing Potential, Shaping Destiny in Daudnagar';
  const aboutText1 = settings.aboutText1 || settings.aboutText || settings.about || 'S.S. Global Public School was established with a singular objective: to bring high quality CBSE education within reach of every student in Daudnagar and surrounding regions. Under the guidance of Principal Manish Singh, the institution has grown into a premier seat of learning.';
  const aboutText2 = settings.aboutText2 || 'We believe that education must extend beyond textbooks. Our campus blends modern technology with traditional Indian ethics, giving students the tools to compete globally while remaining rooted in strong values.';
  const buildingImg = getImageUrl(settings.aboutImage || settings.heroImage || '/school.webp');
  const expNumber = settings.aboutExpNumber || '15+';
  const expText = settings.aboutExpText || 'Years of Educational Excellence';

  const principalPhoto = getImageUrl(settings.principalPhoto || '/principle.png');
  const principalName = settings.principalName || 'Manish Singh';
  const principalMessage = settings.principalMessage || 'Welcome to S.S. Global Public School, Daudnagar. Our commitment is to foster academic excellence, holistic development, and moral values in a modern learning environment.';

  const directorPhoto = getImageUrl(settings.directorPhoto || '/school.webp');
  const directorName = settings.directorName || 'Er. R. P. Singh';
  const directorMessage = settings.directorMessage || 'We believe every child has infinite potential. At S.S. Global, we provide world-class infrastructure, smart labs, and guidance to turn dreams into reality.';

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

  const values = [
    { title: 'Academic Excellence', desc: 'Striving for continuous improvement and highest standards in all disciplines.', icon: <FiAward className="text-amber-500 text-2xl" /> },
    { title: 'Moral Integrity', desc: 'Instilling truthfulness, honesty, discipline, and respect for all human values.', icon: <FiHeart className="text-rose-500 text-2xl" /> },
    { title: 'Innovation & Curiosity', desc: 'Encouraging inquiry, technological fluency, and creative problem solving.', icon: <FiBookOpen className="text-blue-500 text-2xl" /> },
    { title: 'Inclusivity & Unity', desc: 'Creating a supportive community where every child feels valued and inspired.', icon: <FiShield className="text-emerald-500 text-2xl" /> },
  ];

  return (
    <div>
      <PageHeader
        title={heroTitle}
        subtitle={heroSubtitle}
        breadcrumb={[{ label: 'About School' }]}
      />

      {/* Intro & History Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-6 space-y-6">
              <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full border border-blue-200">
                {aboutBadge}
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 leading-tight">
                {aboutTitle}
              </h2>
              <p className="text-slate-600 text-base leading-relaxed">
                {aboutText1}
              </p>
              {aboutText2 && (
                <p className="text-slate-600 text-base leading-relaxed">
                  {aboutText2}
                </p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-sm text-slate-700 font-medium">
                    <FiCheckCircle className="text-blue-600 text-lg shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 relative">
              <div className="rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-100 relative">
                <img
                  src={buildingImg}
                  alt="S.S. Global Public School Building"
                  width="600"
                  height="384"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-96 object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-2 sm:right-6 z-20 bg-slate-900 text-white p-5 rounded-2xl shadow-xl border border-slate-700 max-w-xs">
                <span className="text-3xl font-extrabold text-amber-400 font-serif block">{expNumber}</span>
                <span className="text-xs text-slate-300 font-medium uppercase tracking-wider block">{expText}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Cards */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Vision */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4 card-hover">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-2xl">
                <FiEye />
              </div>
              <h3 className="text-2xl font-bold font-serif text-slate-900">Our Vision</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                {settings.vision || 'To create a benchmark educational institution that nurtures confident, compassionate, and globally competent citizens equipped with modern technology and ethical values.'}
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4 card-hover">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-2xl">
                <FiTarget />
              </div>
              <h3 className="text-2xl font-bold font-serif text-slate-900">Our Mission</h3>
              <p className="text-slate-600 text-base leading-relaxed">
                {settings.mission || 'Providing quality education with modern facilities, smart classrooms, science laboratories, holistic sports, and strong moral grounding for every child.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Messages */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          <div className="text-center max-w-3xl mx-auto">
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-50 px-3.5 py-1 rounded-full">
              Leadership Guidance
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 mt-3">
              Messages From Our Leadership
            </h2>
          </div>

          {/* Principal Message */}
          <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 text-center">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2 bg-gradient-to-r from-blue-600 to-amber-500 mx-auto shadow-lg mb-4 overflow-hidden">
                <img
                  src={principalPhoto}
                  alt={`Principal ${principalName}`}
                  width="192"
                  height="192"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full bg-slate-100"
                />
              </div>
              <h4 className="text-xl font-bold text-slate-900 font-serif">{principalName}</h4>
              <p className="text-xs font-semibold text-blue-600">Principal, S.S. Global Public School</p>
            </div>
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-xl font-bold font-serif text-slate-900">Principal's Message</h3>
              <p className="text-slate-600 italic leading-relaxed text-base">
                "{principalMessage}"
              </p>
            </div>
          </div>

          {/* Director Message */}
          <div className="bg-slate-50 p-8 sm:p-12 rounded-3xl border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-4 text-center">
              <div className="w-40 h-40 sm:w-48 sm:h-48 rounded-full p-2 bg-gradient-to-r from-amber-500 to-blue-600 mx-auto shadow-lg mb-4 overflow-hidden">
                <img
                  src={directorPhoto}
                  alt={`Director ${directorName}`}
                  width="192"
                  height="192"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover rounded-full bg-slate-100"
                />
              </div>
              <h4 className="text-xl font-bold text-slate-900 font-serif">{directorName}</h4>
              <p className="text-xs font-semibold text-amber-600">Director, S.S. Global Public School</p>
            </div>
            <div className="lg:col-span-8 space-y-3">
              <h3 className="text-xl font-bold font-serif text-slate-900">Director's Message</h3>
              <p className="text-slate-600 italic leading-relaxed text-base">
                "{directorMessage}"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl font-extrabold font-serif text-slate-900">Our Core School Values</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-3 card-hover">
                <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                  {v.icon}
                </div>
                <h4 className="font-bold text-lg text-slate-900 font-serif">{v.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
