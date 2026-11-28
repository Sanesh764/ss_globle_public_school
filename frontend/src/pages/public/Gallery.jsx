import React, { useState } from 'react';
import PageHeader from '../../components/common/PageHeader';
import SEO from '../../components/common/SEO';
import { PUBLIC_ROUTE_SEO } from '../../utils/seoRoutesConfig';
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
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://www.ssglobalpublicschool.com/' },
      { '@type': 'ListItem', position: 2, name: 'Photo Gallery', item: 'https://www.ssglobalpublicschool.com/gallery' },
    ],
  };

  return (
    <main className="bg-[#F4EFE3] text-[#252821]">
      <SEO
        title={PUBLIC_ROUTE_SEO['/gallery'].title}
        description={PUBLIC_ROUTE_SEO['/gallery'].description}
        canonicalUrl={PUBLIC_ROUTE_SEO['/gallery'].canonicalUrl}
        ogImage={PUBLIC_ROUTE_SEO['/gallery'].ogImage}
        jsonLd={gallerySchema}
      />
      <PageHeader
        title="Photo Gallery"
        subtitle="Capturing memorable academic moments, sports competitions, celebrations, and campus life at S.S. Global Public School."
        breadcrumb={[{ label: 'Gallery' }]}
      />

      <section className="py-14 bg-[#F4EFE3] min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          {/* Category Filter Tabs */}
          <div className="flex flex-wrap justify-center gap-2 border-b border-[#CFC5B1] pb-6">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-sm text-xs sm:text-sm font-semibold transition-colors border ${
                  activeCategory === cat
                    ? 'bg-[#34483B] text-[#F4EFE3] border-[#34483B]'
                    : 'bg-[#EBE2CC]/60 text-[#252821] border-[#CFC5B1] hover:bg-[#DED5C1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {loading ? (
            <LoadingSpinner text="Loading Photographs..." />
          ) : error ? (
            <div className="p-10 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm font-medium">
              Information is temporarily unavailable. Please check again shortly.
            </div>
          ) : galleryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {galleryItems.map((item, idx) => (
                <figure
                  key={item._id || idx}
                  onClick={() => {
                    setSelectedImg(item);
                    trackGalleryImageClick(item.title, item.category);
                  }}
                  className="group cursor-pointer bg-[#EBE2CC]/55 border border-[#CFC5B1] hover:border-[#AD8746] rounded-sm overflow-hidden transition-colors"
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
                  <figcaption className="px-4 py-3 border-t border-[#CFC5B1]">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[#AD8746] block">
                      {item.category || 'Gallery'}
                    </span>
                    <h3 className="text-sm font-bold font-serif text-[#34483B] truncate mt-0.5">
                      {item.title}
                    </h3>
                  </figcaption>
                </figure>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] text-[#55594E] text-sm">
              No photos found in category “{activeCategory}”.
            </div>
          )}
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
                  {selectedImg.category}
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg">{selectedImg.title}</h3>
              </div>
              <button
                onClick={() => setSelectedImg(null)}
                className="p-1.5 text-[#EBE2CC] hover:text-white bg-[#27372D] rounded-sm border border-[#4B6353]"
                aria-label="Close Preview"
              >
                <FiX className="text-lg" />
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
    </main>
  );
};

export default Gallery;
