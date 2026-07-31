import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiFileText, FiCalendar, FiSun, FiEdit3, FiArrowRight, FiDownload, FiEye } from 'react-icons/fi';

const CALENDAR_PDF_URL = '/pdf/ACADEMIC%20CALENDER..pdf';

const PREVIEW_RESOURCES = [
  {
    id: 'book-list',
    title: 'Book List',
    category: 'Book List',
    icon: <FiBookOpen className="text-emerald-400 text-xl" />,
    badgeColor: 'bg-emerald-400/10 text-emerald-300 border-emerald-400/20',
    isAvailable: false,
  },
  {
    id: 'syllabus',
    title: 'Syllabus',
    category: 'Syllabus',
    icon: <FiFileText className="text-blue-400 text-xl" />,
    badgeColor: 'bg-blue-400/10 text-blue-300 border-blue-400/20',
    isAvailable: false,
  },
  {
    id: 'academic-calendar',
    title: 'Academic Calendar',
    category: 'Academic Calendar',
    description: 'Official S.S. Global Public School Academic Calendar',
    icon: <FiCalendar className="text-indigo-400 text-xl" />,
    badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    isAvailable: true,
    pdfUrl: CALENDAR_PDF_URL,
  },
  {
    id: 'holiday-calendar',
    title: 'Holiday Calendar',
    category: 'Holiday Calendar',
    icon: <FiSun className="text-amber-400 text-xl" />,
    badgeColor: 'bg-amber-400/10 text-amber-300 border-amber-400/20',
    isAvailable: false,
  },
  {
    id: 'annual-calendar',
    title: 'Annual Calendar',
    category: 'Annual Calendar',
    icon: <FiEdit3 className="text-purple-400 text-xl" />,
    badgeColor: 'bg-purple-400/10 text-purple-300 border-purple-400/20',
    isAvailable: false,
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
              Access official academic documents including the Academic Calendar, Book List, Syllabus, Holiday Calendar, and Annual Calendar. Additional resources will be published as they become available.
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
              className={`bg-slate-800/90 border rounded-2xl p-5 flex flex-col justify-between transition-all duration-300 shadow-lg group hover:-translate-y-1 ${
                item.isAvailable ? 'border-amber-400/80 shadow-amber-500/5' : 'border-slate-700/80 hover:border-amber-400/60'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${item.badgeColor}`}>
                    {item.category} {item.isAvailable && '• AVAILABLE'}
                  </span>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-700/60 border border-slate-600 flex items-center justify-center text-xl shrink-0 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold font-serif text-white text-base leading-snug group-hover:text-amber-300 transition-colors">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-slate-700/60 flex items-center justify-end gap-2 flex-wrap sm:flex-nowrap">
                {item.isAvailable ? (
                  <>
                    <a
                      href={item.pdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-700/80 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs rounded-xl border border-slate-600 transition-colors inline-flex items-center gap-1 shrink-0"
                      title="View Calendar in New Tab"
                    >
                      <FiEye className="text-sm" /> View
                    </a>
                    <a
                      href={item.pdfUrl}
                      download="Academic_Calendar_SS_Global_Public_School.pdf"
                      className="px-4 py-1.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-colors inline-flex items-center gap-1.5 shrink-0"
                    >
                      <FiDownload className="text-sm" /> Download Calendar
                    </a>
                  </>
                ) : (
                  <button
                    disabled
                    className="px-3.5 py-1.5 bg-slate-700/60 text-slate-400 font-bold text-[11px] rounded-xl cursor-not-allowed border border-slate-600/50"
                  >
                    📄 Available Soon
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DownloadsPreview;
