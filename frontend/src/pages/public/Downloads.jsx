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
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ssglobalpublicschool.com/' },
      { '@type': 'ListItem', position: 2, name: 'Academic Resources', item: 'https://www.ssglobalpublicschool.com/downloads' },
    ],
  };

  return (
    <main className="bg-[#F4EFE3] text-[#252821]">
      <SEO
        title="Academic Resources & Downloads | S.S. Global Public School Daudnagar"
        description="Download official academic resources, CBSE syllabus guidelines, book lists & Academic Calendar for S.S. Global Public School, Daudnagar, Bihar."
        keywords="S.S. Global Public School academic calendar, S.S. Global Public School Daudnagar, CBSE syllabus Daudnagar, school book list Aurangabad, academic resources Bihar"
        canonicalUrl="https://www.ssglobalpublicschool.com/downloads"
        jsonLd={downloadsSchema}
      />
      <PageHeader
        title="Academic Resources"
        subtitle="Access official academic documents including the Academic Calendar, syllabus, book lists, and examination schedules."
        breadcrumb={[{ label: 'Academic Resources' }]}
      />

      <section className="py-14 bg-[#F4EFE3] min-h-[70vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Information Notice Banner */}
          <div className="bg-[#34483B] text-[#F4EFE3] p-7 sm:p-8 rounded-sm border border-[#27372D] flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746] inline-flex items-center gap-1.5">
                <FiClock /> Official Academic Portal
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold font-serif tracking-tight text-[#F4EFE3]">
                Official School Academic Resources
              </h2>
              <p className="text-[#EBE2CC]/85 text-sm max-w-2xl leading-relaxed">
                Access official academic documents including the Academic Calendar, book lists, examination routines, and syllabus guidelines.
              </p>
            </div>

            <div className="px-4 py-2.5 rounded-sm bg-[#27372D] border border-[#4B6353] text-xs font-semibold text-[#EBE2CC] shrink-0 flex items-center gap-2">
              <FiBookOpen className="text-[#AD8746] text-base" /> S.S. Global Academic Portal
            </div>
          </div>

          <div className="space-y-5">
            <h3 className="text-xl font-bold font-serif text-[#34483B] border-l-2 border-[#AD8746] pl-3">
              Official Academic Publications
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Static Academic Calendar Card */}
              <div className="bg-[#EBE2CC]/75 rounded-sm p-6 border-2 border-[#AD8746] flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-sm text-[10px] font-semibold uppercase tracking-wider bg-[#F4EFE3] text-[#34483B] border border-[#CFC5B1] flex items-center gap-1.5">
                      <FiCalendar className="text-[#AD8746]" /> Academic Calendar
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#F4EFE3] bg-[#34483B] px-2.5 py-0.5 rounded-sm">
                      Available
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-bold font-serif text-[#34483B] text-xl leading-snug">
                      Academic Calendar
                    </h4>
                    <p className="text-[#55594E] text-xs leading-relaxed bg-[#F4EFE3] p-3.5 rounded-sm border border-[#CFC5B1]">
                      Official S.S. Global Public School Academic Calendar detailing term dates, holidays, and examination schedules.
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-5 border-t border-[#CFC5B1] flex items-center gap-3">
                  <a
                    href={CALENDAR_PDF_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-3 bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#34483B] font-semibold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5 border border-[#CFC5B1]"
                  >
                    <FiEye className="text-sm" /> View PDF
                  </a>
                  <a
                    href={CALENDAR_PDF_URL}
                    download="Academic_Calendar_SS_Global_Public_School.pdf"
                    className="flex-1 py-2.5 px-3 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-xs rounded-sm transition-colors flex items-center justify-center gap-1.5"
                  >
                    <FiDownload className="text-sm text-[#AD8746]" /> Download PDF
                  </a>
                </div>
              </div>

              {/* Dynamic Uploaded Resources */}
              {loading ? (
                <div className="col-span-1 md:col-span-2 flex items-center justify-center py-12">
                  <p className="text-[#55594E] text-sm font-medium">Loading additional resources...</p>
                </div>
              ) : error ? (
                <div className="col-span-1 md:col-span-2 p-8 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm font-medium">
                  Additional online resources are temporarily unavailable. Please check again shortly.
                </div>
              ) : (
                resourcesList.map((item) => {
                  const imgUrl = item.image || item.fileUrl;
                  return (
                    <div
                      key={item._id}
                      onClick={() => imgUrl && setSelectedImg(item)}
                      className="bg-[#EBE2CC]/55 rounded-sm p-5 border border-[#CFC5B1] hover:border-[#AD8746] flex flex-col justify-between transition-colors group cursor-pointer"
                    >
                      <div className="space-y-4">
                        <div className="w-full h-52 rounded-sm overflow-hidden bg-[#DED5C1] border border-[#CFC5B1] relative">
                          {imgUrl ? (
                            <>
                              <img
                                src={getImageUrl(imgUrl)}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                              />
                              <div className="absolute top-3 right-3 p-2 bg-[#F4EFE3]/95 text-[#34483B] rounded-sm border border-[#CFC5B1] opacity-0 group-hover:opacity-100 transition-opacity">
                                <FiEye className="text-base" />
                              </div>
                            </>
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#55594E] gap-2">
                              <FiImage className="text-3xl" />
                              <span className="text-xs font-medium">No Image Uploaded</span>
                            </div>
                          )}
                        </div>

                        <div>
                          <h4 className="font-bold font-serif text-[#34483B] text-lg leading-snug flex items-center justify-between">
                            {item.title}
                            {imgUrl && <FiEye className="text-[#AD8746] text-base shrink-0" />}
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

      {/* Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 bg-[#252821]/85 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setSelectedImg(null)}
        >
          <div
            className="max-w-4xl w-full bg-[#F4EFE3] rounded-sm overflow-hidden border border-[#CFC5B1] shadow-xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 py-3.5 bg-[#34483B] text-[#F4EFE3] flex justify-between items-center border-b border-[#AD8746]">
              <div>
                <span className="text-[10px] text-[#AD8746] font-semibold uppercase tracking-wider block">
                  Academic Resource
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg">{selectedImg.title}</h3>
              </div>
              <button
                onClick={() => setSelectedImg(null)}
                className="p-1.5 text-[#EBE2CC] hover:text-white bg-[#27372D] rounded-sm border border-[#4B6353]"
                title="Close (ESC)"
                aria-label="Close Preview"
              >
                <FiX className="text-lg" />
              </button>
            </div>
            <div className="p-3 bg-[#EBE2CC] flex justify-center items-center max-h-[78vh]">
              <img
                src={getImageUrl(selectedImg.image || selectedImg.fileUrl)}
                alt={selectedImg.title}
                className="max-h-[72vh] w-auto max-w-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Downloads;
