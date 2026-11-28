import React, { useContext } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import { PUBLIC_ROUTE_SEO } from '../../utils/seoRoutesConfig';
import { SettingContext } from '../../context/SettingContext';
import { getImageUrl } from '../../services/api';
import { FiEye, FiTarget, FiHeart, FiAward, FiShield, FiBookOpen, FiCheck } from 'react-icons/fi';

const About = () => {
  const { settings } = useContext(SettingContext);

  const heroTitle = settings.aboutHeroTitle || 'About S.S. Global Public School';
  const heroSubtitle =
    settings.aboutHeroSubtitle ||
    'Dedicated to excellence in education, character building, and leadership in Daudnagar, Bihar.';
  const aboutBadge = settings.aboutBadge || 'Our Legacy & History';
  const aboutTitle = settings.aboutTitle || 'Nurturing Potential, Shaping Destiny in Daudnagar';
  const aboutText1 =
    settings.aboutText1 ||
    settings.aboutText ||
    settings.about ||
    'S.S. Global Public School was established with a singular objective: to bring high quality CBSE education within reach of every student in Daudnagar and surrounding regions. Under visionary guidance, the institution has grown into a premier seat of learning.';
  const aboutText2 =
    settings.aboutText2 ||
    'We believe that education must extend beyond textbooks. Our campus blends modern technology with traditional Indian ethics, giving students the tools to compete globally while remaining rooted in strong values.';
  const buildingImg = getImageUrl(settings.aboutImage || settings.heroImage || '/school.webp');
  const expNumber = settings.aboutExpNumber || '15+';

  const founderPhoto = getImageUrl(settings.founderPhoto || '/founder_image.jpeg');
  const founderName = settings.founderName || 'Shambhu Sharan Singh';
  const founderMessage =
    settings.founderMessage ||
    'Our foundational goal is to provide world-class CBSE education in Daudnagar. We empower students with critical thinking, sportsmanship, technological literacy, and strong moral grounding.';

  const directorPhoto = getImageUrl(settings.directorPhoto || '/Director_image.jpeg');
  const directorName = settings.directorName || 'Er. Manish Singh';
  const directorMessage =
    settings.directorMessage ||
    'We believe every child has infinite potential. At S.S. Global, we provide world-class infrastructure, smart labs, and guidance to turn dreams into reality.';

  const principalPhoto = getImageUrl(settings.principalPhoto || '/Principle_image.jpg');
  const principalName = settings.principalName || 'Ashutosh Kumar';
  const principalMessage =
    settings.principalMessage ||
    'Welcome to S.S. Global Public School, Daudnagar. Our commitment is to foster academic excellence, holistic development, and moral values in a modern learning environment.';

  const aboutSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ssglobalpublicschool.com/' },
      { '@type': 'ListItem', position: 2, name: 'About School', item: 'https://www.ssglobalpublicschool.com/about' },
    ],
  };

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

  const values = [
    {
      title: 'Academic Excellence',
      desc: 'Striving for continuous improvement and highest standards in all disciplines.',
      icon: FiAward,
    },
    {
      title: 'Moral Integrity',
      desc: 'Instilling truthfulness, honesty, discipline, and respect for all human values.',
      icon: FiHeart,
    },
    {
      title: 'Innovation & Curiosity',
      desc: 'Encouraging inquiry, technological fluency, and creative problem solving.',
      icon: FiBookOpen,
    },
    {
      title: 'Inclusivity & Unity',
      desc: 'Creating a supportive community where every child feels valued and inspired.',
      icon: FiShield,
    },
  ];

  const leadershipList = [
    {
      role: "Founder's Message",
      title: 'Founder, S.S. Global Public School',
      name: founderName,
      photo: founderPhoto,
      message: founderMessage,
    },
    {
      role: "Director's Message",
      title: 'Director, S.S. Global Public School',
      name: directorName,
      photo: directorPhoto,
      message: directorMessage,
    },
    {
      role: "Principal's Message",
      title: 'Principal, S.S. Global Public School',
      name: principalName,
      photo: principalPhoto,
      message: principalMessage,
    },
  ];

  return (
    <main className="bg-[#F4EFE3] text-[#252821]">
      <SEO
        title={PUBLIC_ROUTE_SEO['/about'].title}
        description={PUBLIC_ROUTE_SEO['/about'].description}
        canonicalUrl={PUBLIC_ROUTE_SEO['/about'].canonicalUrl}
        ogImage={PUBLIC_ROUTE_SEO['/about'].ogImage}
        jsonLd={aboutSchema}
      />
      <PageHeader title={heroTitle} subtitle={heroSubtitle} breadcrumb={[{ label: 'About School' }]} />

      {/* Intro & History Section */}
      <section className="py-16 sm:py-20 bg-[#F4EFE3] border-b border-[#CFC5B1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6 space-y-5">
              <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
                <span className="w-6 h-[1.5px] bg-[#AD8746]" />
                <span>{aboutBadge}</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] leading-tight tracking-tight">
                {aboutTitle}
              </h2>
              <p className="text-[#55594E] text-sm sm:text-base leading-relaxed">{aboutText1}</p>
              {aboutText2 && <p className="text-[#55594E] text-sm sm:text-base leading-relaxed">{aboutText2}</p>}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 pt-3 border-t border-[#CFC5B1]">
                {features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="py-2 border-b border-[#CFC5B1]/70 flex items-start gap-2.5 text-xs sm:text-sm text-[#252821] font-medium"
                  >
                    <FiCheck className="text-[#34483B] text-sm shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="lg:col-span-6 space-y-5">
              <div className="bg-[#EBE2CC] p-2.5 rounded-sm border border-[#CFC5B1] overflow-hidden">
                <div className="overflow-hidden">
                  <img
                    src={buildingImg}
                    alt="S.S. Global Public School campus building in Daudnagar, Bihar"
                    width="600"
                    height="384"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-[320px] sm:h-[400px] object-cover hover:scale-[1.02] transition-transform duration-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 bg-[#EBE2CC] border border-[#CFC5B1] rounded-sm divide-x divide-[#CFC5B1]">
                <div className="py-4 px-3 text-center">
                  <span className="text-xl sm:text-2xl font-bold font-serif text-[#34483B] block">{expNumber}</span>
                  <span className="text-[10px] font-semibold text-[#AD8746] uppercase tracking-[0.14em] block mt-0.5">
                    Excellence
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
                    Affiliated
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16 bg-[#EBE2CC] border-b border-[#CFC5B1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-[#F4EFE3] p-8 rounded-sm border border-[#CFC5B1] space-y-4">
              <div className="w-11 h-11 rounded-sm bg-[#34483B] text-[#AD8746] flex items-center justify-center text-xl">
                <FiEye />
              </div>
              <h3 className="text-2xl font-bold font-serif text-[#34483B]">Our Vision</h3>
              <p className="text-[#55594E] text-sm sm:text-base leading-relaxed">
                {settings.vision ||
                  'To create a benchmark educational institution that nurtures confident, compassionate, and globally competent citizens equipped with modern technology and ethical values.'}
              </p>
            </div>

            <div className="bg-[#F4EFE3] p-8 rounded-sm border border-[#CFC5B1] space-y-4">
              <div className="w-11 h-11 rounded-sm bg-[#34483B] text-[#AD8746] flex items-center justify-center text-xl">
                <FiTarget />
              </div>
              <h3 className="text-2xl font-bold font-serif text-[#34483B]">Our Mission</h3>
              <p className="text-[#55594E] text-sm sm:text-base leading-relaxed">
                {settings.mission ||
                  'Providing quality education with modern facilities, smart classrooms, science laboratories, holistic sports, and strong moral grounding for every child.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Messages */}
      <section className="py-16 sm:py-20 bg-[#F4EFE3] border-b border-[#CFC5B1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="max-w-3xl space-y-2.5 pb-5 border-b border-[#CFC5B1]">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Leadership Guidance</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B]">
              Messages From Our Leadership
            </h2>
          </div>

          <div className="space-y-8">
            {leadershipList.map((item, idx) => (
              <div
                key={idx}
                className="bg-[#EBE2CC]/60 p-7 sm:p-10 rounded-sm border border-[#CFC5B1] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
              >
                <div className="lg:col-span-3 flex flex-col items-center text-center">
                  <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-sm p-1.5 bg-[#F4EFE3] border border-[#CFC5B1] mb-3 overflow-hidden">
                    <img
                      src={item.photo}
                      alt={item.name}
                      width="160"
                      height="160"
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h4 className="text-lg font-bold text-[#34483B] font-serif">{item.name}</h4>
                  <p className="text-[11px] font-semibold text-[#AD8746] uppercase tracking-wider mt-0.5">
                    {item.title}
                  </p>
                </div>
                <div className="lg:col-span-9 space-y-3 lg:border-l lg:border-[#CFC5B1] lg:pl-8">
                  <h3 className="text-xl font-bold font-serif text-[#34483B]">{item.role}</h3>
                  <p className="text-[#252821] italic leading-relaxed text-sm sm:text-base">
                    “{item.message}”
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-16 bg-[#EBE2CC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Institutional Ethos</span>
            </div>
            <h2 className="text-3xl font-bold font-serif text-[#34483B]">Our Core School Values</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => {
              const Icon = v.icon;
              return (
                <div
                  key={i}
                  className="bg-[#F4EFE3] p-6 rounded-sm border border-[#CFC5B1] space-y-3"
                >
                  <div className="w-10 h-10 rounded-sm bg-[#EBE2CC] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center">
                    <Icon className="text-lg" />
                  </div>
                  <h4 className="font-bold text-lg text-[#34483B] font-serif">{v.title}</h4>
                  <p className="text-xs sm:text-sm text-[#55594E] leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
