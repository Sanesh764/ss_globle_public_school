import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import { FiBookOpen, FiImage, FiClock, FiEye, FiDownload, FiX, FiCalendar } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { getPublicAcademicResourcesApi } from '../../services/academicResourceService';
import { getImageUrl } from '../../services/api';

const CALENDAR_PDF_URL = '/pdf/ACADEMIC%20CALENDER..pdf';

const Downloads = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const { data, loading, error } = useFetch(getPublicAcademicResourcesApi);

  const resourcesList = data?.data?.resources || data?.resources || [];

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setSelectedImg(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const downloadsSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': 'https://ssglobalpublicschool.com/',
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': 'Academic Resources',
        'item': 'https://ssglobalpublicschool.com/downloads',
      },
    ],
  };

  return (
    <main>
      <SEO
        title="Academic Resources & Downloads | CBSE Syllabus & Calendar"
        description="Download official academic resources, Academic Calendar, syllabus, book lists & examination routines for S.S. Global Public School, Daudnagar."
        keywords="S.S. Global Public School academic calendar, CBSE syllabus Daudnagar, school book list Aurangabad, academic resources Bihar"
        canonicalUrl="https://ssglobalpublicschool.com/downloads"
        jsonLd={downloadsSchema}
      />
      <PageHeader
        title="Academic Resources"
        subtitle="Access official academic documents including the Academic Calendar, syllabus, book lists, and examination schedules."
        breadcrumb={[{ label: 'Academic Resources' }]}
      />

      <section className="py-14 bg-slate-50 min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Information Notice Banner */}
          <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="space-y-2 relative z-10">
              <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 inline-flex items-center gap-1.5">
                <FiClock /> OFFICIAL ACADEMIC PORTAL
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-serif tracking-tight text-white">
                Official School Academic Resources
              </h2>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Access official academic documents including the Academic Calendar, book lists, examination routines, and syllabus guidelines.
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200 shrink-0 flex items-center gap-2">
              <FiBookOpen className="text-amber-400 text-base" /> S.S. Global Academic Portal
            </div>
          </div>

          {/* Featured Official Static Resource Card: Academic Calendar */}
          <div className="space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-blue-600 pl-3">
              Official Academic Publications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Official Static Academic Calendar Card */}
              <div className="bg-white rounded-3xl p-6 shadow-md border-2 border-amber-400/80 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 relative group">
                <div className="space-y-4">
                  {/* Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1.5">
                      <FiCalendar className="text-amber-600" /> Academic Calendar
                    </span>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      AVAILABLE
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                      <FiCalendar />
                    </div>
                    <h4 className="font-bold font-serif text-slate-900 text-xl leading-snug group-hover:text-blue-600 transition-colors">
                      Academic Calendar
                    </h4>
                    <p className="text-slate-600 text-xs leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                      Official S.S. Global Public School Academic Calendar detailing term dates, holidays, and examination schedules.
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-5 mt-6 border-t border-slate-100 flex items-center gap-3">
                  <a
                    href={CALENDAR_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-2xl transition-all flex items-center justify-center gap-1.5 border border-slate-200"
                  >
                    <FiEye className="text-sm text-blue-600" /> View PDF
                  </a>
                  <a
                    href={CALENDAR_PDF_URL}
                    download="Academic_Calendar_SS_Global_Public_School.pdf"
                    className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-2xl shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-1.5"
                  >
                    <FiDownload className="text-sm" /> Download PDF
                  </a>
                </div>
              </div>

              {/* Dynamic Uploaded Resources from Backend */}
              {loading ? (
                <div className="col-span-1 md:col-span-2 flex items-center justify-center py-12">
                  <p className="text-slate-500 text-sm font-semibold">Loading additional resources...</p>
                </div>
              ) : error ? (
                <div className="col-span-1 md:col-span-2 p-8 text-center bg-white rounded-3xl border border-slate-200 text-amber-800 text-sm font-semibold">
                  Additional online resources are temporarily unavailable. Please check again shortly.
                </div>
              ) : (
                resourcesList.map((item) => {
                  const imgUrl = item.image || item.fileUrl;
                  return (
                    <div
                      key={item._id}
                      onClick={() => imgUrl && setSelectedImg(item)}
                      className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="w-full h-56 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
                          {imgUrl ? (
                            <>
                              <img
                                src={getImageUrl(imgUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <span className="p-3 bg-white/90 text-slate-900 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                                  <FiEye className="text-xl text-blue-600" />
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 gap-2">
                              <FiImage className="text-4xl" />
                              <span className="text-xs font-semibold">No Image Uploaded</span>
                            </div>
                          )}
                        </div>

                        <div className="pt-2">
                          <h4 className="font-bold font-serif text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors flex items-center justify-between">
                            {item.title}
                            {imgUrl && <FiEye className="text-slate-400 text-base group-hover:text-blue-600 shrink-0" />}
                          </h4>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Lightbox Modal for Uploaded Resource Images */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImg(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative animate-in fade-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <span className="text-xs text-amber-400 font-semibold uppercase tracking-wider">Academic Resource</span>
                <h3 className="font-serif font-bold text-lg text-white">{selectedImg.title}</h3>
              </div>
              <button
                onClick={() => setSelectedImg(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors"
                title="Close (ESC)"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-4 flex justify-center items-center max-h-[78vh] bg-slate-950/60">
              <img
                src={getImageUrl(selectedImg.image || selectedImg.fileUrl)}
                alt={selectedImg.title}
                className="max-h-[72vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl border border-slate-800/80"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Downloads;
