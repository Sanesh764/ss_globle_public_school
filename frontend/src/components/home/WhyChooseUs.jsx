import React from 'react';
import { FiAward, FiBookOpen, FiShield, FiUsers, FiActivity, FiSmile } from 'react-icons/fi';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <FiAward className="text-3xl text-amber-500" />,
      title: 'Academic Excellence',
      description: 'Structured CBSE curriculum designed to foster deep understanding, critical problem solving, and top examination performance.',
    },
    {
      icon: <FiBookOpen className="text-3xl text-blue-500" />,
      title: 'Smart Tech Classrooms',
      description: 'Digital interactive boards, multimedia presentations, and internet-enabled audio-visual learning tools in every classroom.',
    },
    {
      icon: <FiShield className="text-3xl text-emerald-500" />,
      title: 'Safe & Secure Campus',
      description: '24/7 CCTV surveillance, biometric access, guarded campus gates, and dedicated female attendants for junior wing safety.',
    },
    {
      icon: <FiUsers className="text-3xl text-purple-500" />,
      title: 'Qualified Pedagogues',
      description: 'Highly skilled, compassionate teachers dedicated to mentoring each student with personalized guidance.',
    },
    {
      icon: <FiActivity className="text-3xl text-rose-500" />,
      title: 'Sports & Athletics',
      description: 'Spacious playground, inter-house sports competitions, yoga, football, cricket, and physical wellness programs.',
    },
    {
      icon: <FiSmile className="text-3xl text-sky-500" />,
      title: 'Holistic Development',
      description: 'Focus on moral values, public speaking, debates, drama, music, art, and leadership skills development.',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
            Why Parents Trust Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white mt-3">
            Why Choose S.S. Global Public School?
          </h2>
          <p className="text-slate-300 text-base leading-relaxed">
            We provide an environment where children excel academically, grow emotionally, and discover their true potential.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reasons.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-800/80 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-slate-700/80 card-hover group"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-900/90 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-inner">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3 font-serif group-hover:text-blue-400 transition-colors">
                {item.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
