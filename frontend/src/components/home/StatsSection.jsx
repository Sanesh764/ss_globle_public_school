import React from 'react';
import { FiUsers, FiBookOpen, FiSmile, FiAward } from 'react-icons/fi';

const StatsSection = () => {
  const stats = [
    { icon: FiUsers, count: '3,000+', label: 'Enrolled Students' },
    { icon: FiBookOpen, count: '45+', label: 'Qualified Teachers' },
    { icon: FiSmile, count: '100%', label: 'CBSE Pass Rate' },
    { icon: FiAward, count: '25+', label: 'Academic & Sports Awards' },
  ];

  return (
    <section className="bg-[#34483B] py-14 text-[#F4EFE3] border-b border-[#27372D]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 lg:divide-x divide-[#4B6353] text-center">
          {stats.map((st, idx) => {
            const Icon = st.icon;
            return (
              <div key={idx} className="px-4 py-6 lg:py-2 flex flex-col items-center">
                <Icon className="text-xl text-[#AD8746] mb-3" />
                <div className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[#F4EFE3]">
                  {st.count}
                </div>
                <div className="text-[11px] font-semibold text-[#EBE2CC]/80 mt-1.5 uppercase tracking-[0.14em]">
                  {st.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
