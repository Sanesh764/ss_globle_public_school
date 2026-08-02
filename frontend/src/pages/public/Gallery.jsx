import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import { GALLERY_CATEGORIES } from '../../utils/constants';
import { useFetch } from '../../hooks/useFetch';
import { getGalleryApi } from '../../services/galleryService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { getImageUrl } from '../../services/api';
import { FiEye, FiX } from 'react-icons/fi';
import { trackGalleryImageClick } from '../../utils/analytics';

const Gallery = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedImg, setSelectedImg] = useState(null);

  const { data, loading, error } = useFetch(() => getGalleryApi(activeCategory), [activeCategory]);

  const fetchedImages = data?.data?.images || data?.images || (Array.isArray(data?.data) ? data.data : []);
  const galleryItems = Array.isArray(fetchedImages) ? fetchedImages : [];

  const gallerySchema = {
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
        'name': 'Photo Gallery',
        'item': 'https://ssglobalpublicschool.com/gallery',
      },
    ],
  };

  return (
    <main>
      <SEO
        title="Photo & Event Gallery | Campus Life at S.S. Global Public School"
        description="View photos of academic events, sports competitions, celebrations, and campus activities at S.S. Global Public School, Daudnagar, Bihar."
        keywords="S.S. Global Public School gallery, Daudnagar school photos, campus life Bihar, school sports Aurangabad, annual day photos"
        canonicalUrl="https://ssglobalpublicschool.com/gallery"
        jsonLd={gallerySchema}
      />
      <PageHeader
        title="Photo Gallery"
        subtitle="Capturing memorable academic moments, sports competitions, celebrations, and campus life at S.S. Global Public School."
        breadcrumb={[{ label: 'Gallery' }]}
      />

      <section className="py-16 bg-white min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : error ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-amber-800 text-sm font-semibold">
              Information is temporarily unavailable. Please check again shortly.
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, idx) => (
                <div
                  key={item._id || idx}
                  onClick={() => {
                    setSelectedImg(item);
                    trackGalleryImageClick(item.title, item.category);
                  }}
                  className="group relative rounded-2xl overflow-hidden shadow-md cursor-pointer aspect-video bg-slate-200 border border-slate-200 card-hover"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                    <span className="text-amber-400 font-semibold text-xs uppercase tracking-wider">
                      {item.category || 'Gallery'}
                    </span>
                    <h3 className="text-white font-bold text-base font-serif flex items-center justify-between">
                      {item.title}
                      <FiEye className="text-xl text-amber-400" />
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-slate-50 rounded-2xl text-slate-500">
              No photos found in category "{activeCategory}".
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImg && (
        <div
          className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImg(null)}
        >
          <div
            className="max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 bg-slate-950 text-white flex justify-between items-center border-b border-slate-800">
              <div>
                <span className="text-xs text-amber-400 font-semibold uppercase">{selectedImg.category}</span>
                <h3 className="font-serif font-bold text-lg">{selectedImg.title}</h3>
              </div>
              <button
                onClick={() => setSelectedImg(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
              >
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="p-3 flex justify-center max-h-[75vh]">
              <img
                src={getImageUrl(selectedImg.image)}
                alt={selectedImg.title}
                className="max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Gallery;
