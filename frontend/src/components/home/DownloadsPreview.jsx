import React from 'react';
import { Link } from 'react-router-dom';
import { FiBookOpen, FiFileText, FiCalendar, FiSun, FiEdit3, FiArrowRight, FiDownload, FiEye } from 'react-icons/fi';

const CALENDAR_PDF_URL = '/pdf/ACADEMIC%20CALENDER..pdf';

const PREVIEW_RESOURCES = [
  {
    id: 'academic-calendar',
    title: 'Academic Calendar',
    category: 'Academic Calendar',
    description: 'Official S.S. Global Public School Academic Calendar',
    icon: FiCalendar,
    isAvailable: true,
    pdfUrl: CALENDAR_PDF_URL,
  },
  {
    id: 'book-list',
    title: 'Book List',
    category: 'Book List',
    icon: FiBookOpen,
    isAvailable: false,
  },
  {
    id: 'syllabus',
    title: 'Syllabus',
    category: 'Syllabus',
    icon: FiFileText,
    isAvailable: false,
  },
  {
    id: 'holiday-calendar',
    title: 'Holiday Calendar',
    category: 'Holiday Calendar',
    icon: FiSun,
    isAvailable: false,
  },
  {
    id: 'annual-calendar',
    title: 'Annual Calendar',
    category: 'Annual Calendar',
    icon: FiEdit3,
    isAvailable: false,
  },
];

const DownloadsPreview = () => {
  return (
    <section className="py-16 sm:py-20 bg-[#EBE2CC] text-[#252821] border-b border-[#CFC5B1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-5 border-b border-[#CFC5B1]">
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Academic Resources</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif tracking-tight text-[#34483B]">
              Official School Publications
            </h2>
            <p className="text-[#55594E] text-sm leading-relaxed">
              Access official academic documents including the Academic Calendar, Book List, Syllabus, Holiday Calendar, and Annual Calendar.
            </p>
          </div>

          <Link
            to="/downloads"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm transition-colors shrink-0"
          >
            <span>Explore All Resources</span>
            <FiArrowRight className="text-[#AD8746]" />
          </Link>
        </div>

        {/* Ledger-style Publications Table */}
        <div className="bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm divide-y divide-[#CFC5B1]">
          {PREVIEW_RESOURCES.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#EBE2CC]/40 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-sm bg-[#EBE2CC] border border-[#CFC5B1] text-[#34483B] flex items-center justify-center shrink-0">
                    <Icon className="text-lg" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold font-serif text-[#34483B] text-base">
                        {item.title}
                      </h3>
                      <span
                        className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-sm border ${
                          item.isAvailable
                            ? 'bg-[#34483B] text-[#F4EFE3] border-[#34483B]'
                            : 'bg-[#EBE2CC] text-[#55594E] border-[#CFC5B1]'
                        }`}
                      >
                        {item.isAvailable ? 'Available' : 'Coming Soon'}
                      </span>
                    </div>
                    {item.description && (
                      <p className="text-xs text-[#55594E] mt-0.5">
                        {item.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.isAvailable ? (
                    <>
                      <a
                        href={item.pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2 bg-[#EBE2CC] hover:bg-[#DED5C1] text-[#34483B] font-semibold text-xs rounded-sm border border-[#CFC5B1] transition-colors inline-flex items-center gap-1.5"
                        title="View Calendar in New Tab"
                      >
                        <FiEye className="text-sm" /> View
                      </a>
                      <a
                        href={item.pdfUrl}
                        download="Academic_Calendar_SS_Global_Public_School.pdf"
                        className="px-4 py-2 bg-[#AD8746] hover:bg-[#8E6D35] text-white font-semibold text-xs rounded-sm transition-colors inline-flex items-center gap-1.5"
                      >
                        <FiDownload className="text-sm" /> Download PDF
                      </a>
                    </>
                  ) : (
                    <span className="text-xs text-[#55594E] italic px-2">
                      To be published shortly
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default DownloadsPreview;
