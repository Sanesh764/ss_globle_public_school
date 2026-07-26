import React from 'react';
import { FiUsers, FiBookOpen, FiSmile, FiAward } from 'react-icons/fi';

const StatsSection = () => {
  const stats = [
    { icon: <FiUsers className="text-3xl text-amber-400" />, count: '1,200+', label: 'Enrolled Students' },
    { icon: <FiBookOpen className="text-3xl text-blue-400" />, count: '45+', label: 'Qualified Teachers' },
    { icon: <FiSmile className="text-3xl text-emerald-400" />, count: '100%', label: 'CBSE Result Pass Rate' },
    { icon: <FiAward className="text-3xl text-purple-400" />, count: '25+', label: 'Academic & Sports Awards' },
  ];

  return (
    <section className="relative primary-gradient py-14 text-white overflow-hidden shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {stats.map((st, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 hover:bg-white/15 transition-all">
              <div className="flex justify-center mb-3">{st.icon}</div>
              <div className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-white">
                {st.count}
              </div>
              <div className="text-xs sm:text-sm font-medium text-blue-100 mt-1 uppercase tracking-wider">
                {st.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
