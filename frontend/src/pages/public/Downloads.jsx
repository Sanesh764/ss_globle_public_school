import React, { useState, useEffect } from 'react';
import PageHeader from '../../components/common/PageHeader';
import { FiBookOpen, FiImage, FiClock, FiEye, FiX } from 'react-icons/fi';
import useFetch from '../../hooks/useFetch';
import { getPublicAcademicResourcesApi } from '../../services/academicResourceService';
import { getImageUrl } from '../../services/api';

const Downloads = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const { data, loading } = useFetch(getPublicAcademicResourcesApi);

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

  return (
    <div>
      <PageHeader
        title="Academic Resources"
        subtitle="Explore official academic resources, class syllabus, book lists, and calendars."
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
                Access official class resources, book lists, examination routines, and academic calendars. Click any image to view in full screen.
              </p>
            </div>

            <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-xs font-bold text-slate-200 shrink-0 flex items-center gap-2">
              <FiBookOpen className="text-amber-400 text-base" /> S.S. Global Academic Portal
            </div>
          </div>

          {/* Academic Resource Image Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-slate-500 text-sm font-semibold">Loading academic resources...</p>
            </div>
          ) : resourcesList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resourcesList.map((item) => {
                const imgUrl = item.image || item.fileUrl;
                return (
                  <div
                    key={item._id}
                    onClick={() => imgUrl && setSelectedImg(item)}
                    className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group cursor-pointer"
                  >
                    <div className="space-y-4">
                      {/* Image Frame with Hover Eye Icon */}
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

                      {/* Title */}
                      <div className="pt-2">
                        <h3 className="font-bold font-serif text-slate-900 text-lg leading-snug group-hover:text-blue-600 transition-colors flex items-center justify-between">
                          {item.title}
                          {imgUrl && <FiEye className="text-slate-400 text-base group-hover:text-blue-600 shrink-0" />}
                        </h3>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md mx-auto space-y-3">
              <FiBookOpen className="text-4xl text-slate-300 mx-auto" />
              <h3 className="text-lg font-bold font-serif text-slate-800">No Academic Resources Published</h3>
              <p className="text-xs text-slate-500">
                Official academic resource images will be available here soon.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal (Same design system as Gallery) */}
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
    </div>
  );
};

export default Downloads;
