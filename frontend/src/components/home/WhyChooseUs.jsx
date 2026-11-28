import React from 'react';
import { FiAward, FiBookOpen, FiShield, FiUsers, FiActivity, FiSmile } from 'react-icons/fi';

const WhyChooseUs = () => {
  const reasons = [
    {
      num: '01',
      icon: FiAward,
      title: 'Academic Excellence',
      description: 'Structured CBSE curriculum designed to foster deep understanding, critical problem solving, and top examination performance.',
    },
    {
      num: '02',
      icon: FiBookOpen,
      title: 'Smart Tech Classrooms',
      description: 'Digital interactive boards, multimedia presentations, and internet-enabled audio-visual learning tools in every classroom.',
    },
    {
      num: '03',
      icon: FiShield,
      title: 'Safe & Secure Campus',
      description: '24/7 CCTV surveillance, controlled campus gates, and dedicated support staff for junior wing safety.',
    },
    {
      num: '04',
      icon: FiUsers,
      title: 'Qualified Pedagogues',
      description: 'Highly skilled, compassionate teachers dedicated to mentoring each student with personalized guidance.',
    },
    {
      num: '05',
      icon: FiActivity,
      title: 'Sports & Athletics',
      description: 'Spacious playground, inter-house sports competitions, yoga, football, cricket, and physical wellness programs.',
    },
    {
      num: '06',
      icon: FiSmile,
      title: 'Holistic Development',
      description: 'Focus on moral values, public speaking, debates, drama, music, art, and leadership skills development.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-[#F4EFE3] text-[#252821] border-b border-[#CFC5B1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 pb-6 border-b border-[#CFC5B1]">
          <div className="max-w-2xl space-y-2.5">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Why Parents Trust Us</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] tracking-tight">
              Why Choose S.S. Global Public School?
            </h2>
          </div>
          <p className="text-[#55594E] text-sm sm:text-base max-w-md leading-relaxed">
            We provide a disciplined, nurturing environment where children excel academically and grow with confidence.
          </p>
        </div>

        {/* Numbered Editorial Index Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
          {reasons.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.num}
                className="pt-5 border-t-2 border-[#CFC5B1] hover:border-[#34483B] transition-colors group"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-serif font-bold text-[#AD8746]">
                    {item.num}
                  </span>
                  <div className="w-9 h-9 rounded-sm bg-[#EBE2CC] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center group-hover:bg-[#34483B] group-hover:text-[#F4EFE3] transition-colors">
                    <Icon className="text-base" />
                  </div>
                </div>
                <h3 className="text-xl font-bold font-serif text-[#34483B] mb-2 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-[#55594E] text-sm leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
