import React from 'react';
import { FiAward, FiBookOpen, FiShield, FiUsers, FiActivity, FiSmile } from 'react-icons/fi';

const WhyChooseUs = () => {
  const reasons = [
    {
      icon: <FiAward className="text-3xl text-amber-400" />,
      title: 'Academic Excellence',
      description: 'Structured CBSE curriculum designed to foster deep understanding, critical problem solving, and top examination performance.',
    },
    {
      icon: <FiBookOpen className="text-3xl text-blue-400" />,
      title: 'Smart Tech Classrooms',
      description: 'Digital interactive boards, multimedia presentations, and internet-enabled audio-visual learning tools in every classroom.',
    },
    {
      icon: <FiShield className="text-3xl text-emerald-400" />,
      title: 'Safe & Secure Campus',
      description: '24/7 CCTV surveillance, biometric access, guarded campus gates, and dedicated female attendants for junior wing safety.',
    },
    {
      icon: <FiUsers className="text-3xl text-purple-400" />,
      title: 'Qualified Pedagogues',
      description: 'Highly skilled, compassionate teachers dedicated to mentoring each student with personalized guidance.',
    },
    {
      icon: <FiActivity className="text-3xl text-rose-400" />,
      title: 'Sports & Athletics',
      description: 'Spacious playground, inter-house sports competitions, yoga, football, cricket, and physical wellness programs.',
    },
    {
      icon: <FiSmile className="text-3xl text-sky-400" />,
      title: 'Holistic Development',
      description: 'Focus on moral values, public speaking, debates, drama, music, art, and leadership skills development.',
    },
  ];

  return (
    <section className="py-20 bg-slate-900 text-white relative overflow-hidden border-t border-b border-slate-800">
      {/* Subtle Radial Ambient Glow Behind Section */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[35rem] h-[35rem] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-blue-500/10 text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-400/30">
            Why Parents Trust Us
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white mt-3 tracking-tight">
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
              className="relative bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-blue-950/40 transition-all duration-300 border border-slate-800 hover:border-blue-500/40 card-hover group overflow-hidden"
            >
              {/* Soft Blue/Gold Gradient Top Accent Border */}
              <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-blue-600 via-amber-400 to-sky-400 group-hover:h-2 transition-all duration-300" />

              <div className="w-16 h-16 rounded-2xl bg-slate-950/90 border border-slate-800 flex items-center justify-center mb-6 shadow-xl shadow-blue-950/40 group-hover:scale-105 group-hover:border-blue-500/40 transition-all duration-300">
                {item.icon}
              </div>
              <h3 className="text-xl font-bold font-serif text-white mb-3 group-hover:text-blue-400 transition-colors duration-300 tracking-tight">
                {item.title}
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed font-normal">
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
