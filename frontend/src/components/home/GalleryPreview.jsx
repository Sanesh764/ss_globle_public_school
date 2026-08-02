import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiArrowRight } from 'react-icons/fi';
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
    <section className="py-20 bg-slate-900 text-white min-h-[450px] border-t border-slate-800 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-blue-300 font-bold text-xs uppercase tracking-wider bg-blue-500/10 px-3.5 py-1 rounded-full border border-blue-400/30">
              Campus Life
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-white mt-3">
              Photo & Event Gallery
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-amber-400 hover:text-amber-300 font-bold text-sm hover:underline"
          >
            Explore Full Photo Gallery <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <div className="min-h-[300px] flex items-center justify-center">
            <LoadingSpinner />
          </div>
        ) : error ? (
          <div className="p-12 text-center bg-amber-500/10 rounded-2xl border border-amber-400/30 text-amber-300 text-sm font-semibold">
            Information is temporarily unavailable. Please check again shortly.
          </div>
        ) : imagesToShow.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {imagesToShow.map((item, idx) => (
              <div
                key={item._id || idx}
                onClick={() => setSelectedImg(item)}
                className="group relative rounded-3xl overflow-hidden shadow-xl cursor-pointer aspect-video bg-slate-950 border border-slate-800 card-hover"
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  width="400"
                  height="225"
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
                    {item.category || 'Event'}
                  </span>
                  <h3 className="text-white font-bold text-base font-serif flex items-center justify-between">
                    {item.title}
                    <FiEye className="text-xl text-amber-400 shrink-0" />
                  </h3>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400">
            No gallery photos available at this time.
          </div>
        )}

        {/* Modal Lightbox Preview */}
        {selectedImg && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setSelectedImg(null)}>
            <div className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
                <h3 className="font-serif font-bold text-lg">{selectedImg.title}</h3>
                <button onClick={() => setSelectedImg(null)} className="text-slate-400 hover:text-white px-3 py-1 bg-slate-800 rounded-lg text-sm">
                  Close ✕
                </button>
              </div>
              <div className="p-2 flex justify-center max-h-[75vh]">
                <img src={getImageUrl(selectedImg.image)} alt={selectedImg.title} className="max-h-[70vh] object-contain rounded-xl" />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default GalleryPreview;
