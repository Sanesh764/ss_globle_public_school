import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiArrowRight, FiX } from 'react-icons/fi';
import { useFetch } from '../../hooks/useFetch';
import { getGalleryApi } from '../../services/galleryService';
import { getImageUrl } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const GalleryPreview = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const { data, loading, error } = useFetch(() => getGalleryApi('All'), []);

  const fetchedImages = data?.data?.images || data?.images || (Array.isArray(data?.data) ? data.data : []);
  const imagesToShow = Array.isArray(fetchedImages) ? fetchedImages.slice(0, 6) : [];

  return (
    <section className="py-16 sm:py-20 bg-[#F4EFE3] text-[#252821] min-h-[420px] border-b border-[#CFC5B1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4 pb-5 border-b border-[#CFC5B1]">
          <div>
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Campus Life</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] mt-2 tracking-tight">
              Photo &amp; Event Gallery
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-[#34483B] hover:text-[#AD8746] font-semibold text-sm transition-colors"
          >
            <span>Explore Full Photo Gallery</span>
            <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="min-h-[280px] flex items-center justify-center">
            <LoadingSpinner text="Loading Gallery..." />
          </div>
        ) : error ? (
          <div className="p-10 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm">
            Information is temporarily unavailable. Please check again shortly.
          </div>
        ) : imagesToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {imagesToShow.map((item, idx) => (
              <figure
                key={item._id || idx}
                onClick={() => setSelectedImg(item)}
                className="group cursor-pointer bg-[#EBE2CC]/50 border border-[#CFC5B1] hover:border-[#AD8746] rounded-sm overflow-hidden transition-colors"
              >
                <div className="aspect-video overflow-hidden bg-[#DED5C1] relative">
                  <img
                    src={getImageUrl(item.image)}
                    alt={item.title}
                    width="400"
                    height="225"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-sm bg-[#F4EFE3]/90 border border-[#CFC5B1] text-[#34483B] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiEye className="text-sm" />
                  </div>
                </div>
                <figcaption className="px-4 py-3 flex items-center justify-between gap-2 border-t border-[#CFC5B1]">
                  <div className="min-w-0">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#AD8746] block">
                      {item.category || 'Event'}
                    </span>
                    <h3 className="text-sm font-bold font-serif text-[#34483B] truncate">
                      {item.title}
                    </h3>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        ) : (
          <div className="p-10 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm">
            No gallery photos available at this time.
          </div>
        )}

        {/* Modal Lightbox Preview */}
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
                <h3 className="font-serif font-bold text-base sm:text-lg">{selectedImg.title}</h3>
                <button
                  onClick={() => setSelectedImg(null)}
                  className="text-[#EBE2CC] hover:text-white p-1.5 bg-[#27372D] rounded-sm border border-[#4B6353]"
                  aria-label="Close Preview"
                >
                  <FiX className="text-base" />
                </button>
              </div>
              <div className="p-3 bg-[#EBE2CC] flex justify-center max-h-[75vh]">
                <img
                  src={getImageUrl(selectedImg.image)}
                  alt={selectedImg.title}
                  className="max-h-[70vh] object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GalleryPreview;
