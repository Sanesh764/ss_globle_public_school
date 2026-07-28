import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiArrowRight } from 'react-icons/fi';
import { useFetch } from '../../hooks/useFetch';
import { getGalleryApi } from '../../services/galleryService';
import { getImageUrl } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';

const GalleryPreview = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const { data, loading } = useFetch(() => getGalleryApi('All'), []);

  const sampleImages = [
    { title: 'Interactive Smart Classroom', category: 'Facilities', image: '/classRoom.jpg' },
    { title: 'Academic Classroom Session', category: 'Academics', image: '/classes.jpg' },
    { title: 'Annual Sports Day & Athletics Ground', category: 'Sports', image: '/sports.jpg' },
    { title: 'S.S. Global Public School Main Building', category: 'Campus', image: '/school.jpeg' },
    { title: 'Principal Manish Singh Addressing Students', category: 'Campus', image: '/principle.png' },
    { title: 'School Official Crest & Emblem', category: 'Facilities', image: '/logo.jpg' },
  ];

  const fetchedImages = data?.data?.images || data?.images || (Array.isArray(data?.data) ? data.data : []);

  const imagesToShow = fetchedImages && fetchedImages.length > 0 ? fetchedImages.slice(0, 6) : sampleImages;

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-blue-600 font-bold text-xs uppercase tracking-wider bg-blue-100 px-3.5 py-1 rounded-full">
              Campus Life
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-serif text-slate-900 mt-3">
              Photo & Event Gallery
            </h2>
          </div>
          <Link
            to="/gallery"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-bold text-sm hover:underline"
          >
            Explore Full Photo Gallery <FiArrowRight />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {imagesToShow.map((item, idx) => (
              <div
                key={item._id || idx}
                onClick={() => setSelectedImg(item)}
                className="group relative rounded-2xl overflow-hidden shadow-md cursor-pointer aspect-video bg-slate-200 border border-slate-200 card-hover"
              >
                <img
                  src={getImageUrl(item.image)}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                  <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider">
                    {item.category || 'Event'}
                  </span>
                  <h3 className="text-white font-bold text-base font-serif flex items-center justify-between">
                    {item.title}
                    <FiEye className="text-xl text-amber-400" />
                  </h3>
                </div>
              </div>
            ))}
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
