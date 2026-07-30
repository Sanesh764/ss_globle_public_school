import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiFileText, FiCalendar, FiSun, FiEdit3, FiArrowRight } from 'react-icons/fi';

const PREVIEW_RESOURCES = [
  {
    id: 'book-list',
    title: 'Book List',
    category: 'Book List',
    icon: <FiBookOpen className="text-emerald-400 text-xl" />,
    badgeColor: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
  },
  {
    id: 'syllabus',
    title: 'Syllabus',
    category: 'Syllabus',
    icon: <FiFileText className="text-blue-400 text-xl" />,
    badgeColor: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
  },
  {
    id: 'academic-calendar',
    title: 'Academic Calendar',
    category: 'Academic Calendar',
    icon: <FiCalendar className="text-indigo-400 text-xl" />,
    badgeColor: 'bg-indigo-400/10 text-indigo-300 border-indigo-400/20',
  },
  {
    id: 'holiday-calendar',
    title: 'Holiday Calendar',
    category: 'Holiday Calendar',
    icon: <FiSun className="text-amber-400 text-xl" />,
    badgeColor: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
  },
  {
    id: 'annual-calendar',
    title: 'Annual Calendar',
    category: 'Annual Calendar',
    icon: <FiEdit3 className="text-purple-400 text-xl" />,
    badgeColor: 'bg-purple-400/10 text-purple-300 border-purple-400/20',
  },
];

const DownloadsPreview = () => {
  return (
    <section className="py-16 bg-slate-900 text-white relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 border border-amber-400/20 px-3.5 py-1 rounded-full inline-block">
              ACADEMIC RESOURCES
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif tracking-tight text-white border-l-4 border-amber-400 pl-3">
              Official School Publications
            </h2>
            <p className="text-slate-400 text-sm max-w-2xl leading-relaxed">
              Official academic documents such as Book List, Syllabus, Academic Calendar, Holiday Calendar, and Annual Calendar will be available here soon.
            </p>
          </div>

          <Link
            to="/downloads"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all shrink-0"
          >
            Explore All Resources <FiArrowRight />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {PREVIEW_RESOURCES.map((item) => (
            <div
              key={item.id}
              className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400/60 transition-all duration-300 shadow-lg group hover:-translate-y-1"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.category}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/60 border border-slate-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="font-bold font-serif text-white text-base leading-snug group-hover:text-amber-300 transition-colors">
                    {item.title}
                  </h3>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center justify-end">
                <button
                  disabled
                  className="px-3.5 py-1.5 bg-slate-700/60 text-slate-400 font-bold text-[11px] rounded-xl cursor-not-allowed border border-slate-600/50"
                >
                  📄 Available Soon
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DownloadsPreview;
