import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicVideosApi } from '../../services/videoService';
import { formatDate } from '../../utils/formatDate';
import { FiPlay, FiArrowRight, FiCalendar, FiExternalLink } from 'react-icons/fi';

const VideoGallerySection = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeVideos = async () => {
      try {
        setLoading(true);
        const res = await getPublicVideosApi({ limit: 6 });
        if (res.success && res.data) {
          setVideos(res.data.videos || []);
        }
      } catch (err) {
        // Silently catch error on homepage fallback
      } finally {
        setLoading(false);
      }
    };

    fetchHomeVideos();
  }, []);

  if (!loading && videos.length === 0) {
    return null;
  }

  return (
    <section className="py-16 sm:py-20 bg-[#EBE2CC] text-[#252821] border-b border-[#CFC5B1] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#CFC5B1] pb-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#AD8746]">
              <span className="w-6 h-[1.5px] bg-[#AD8746]" />
              <span>Inspiring Moments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold font-serif text-[#34483B] tracking-tight">
              School Video Gallery
            </h2>
            <p className="text-sm text-[#55594E] leading-relaxed">
              Explore classroom activities, annual functions, sports events, and cultural celebrations from S.S. Global Public School.
            </p>
          </div>

          <Link
            to="/videos"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-sm transition-colors shrink-0 group"
          >
            <span>View All Videos</span>
            <FiArrowRight className="text-[#AD8746] group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-[#F4EFE3] rounded-sm border border-[#CFC5B1] overflow-hidden animate-pulse space-y-4 p-4"
              >
                <div className="w-full h-44 bg-[#DED5C1]" />
                <div className="space-y-2">
                  <div className="w-2/3 h-4 bg-[#DED5C1]" />
                  <div className="w-full h-3 bg-[#DED5C1]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.slice(0, 6).map((video) => (
              <a
                key={video._id}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#F4EFE3] rounded-sm border border-[#CFC5B1] hover:border-[#AD8746] overflow-hidden transition-colors flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[#DED5C1] border-b border-[#CFC5B1]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    width="480"
                    height="270"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/school.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-[#252821]/20 group-hover:bg-[#252821]/10 transition-colors" />

                  {video.isFeatured && (
                    <span className="absolute top-3 left-3 bg-[#AD8746] text-white font-semibold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                      Featured
                    </span>
                  )}

                  <span className="absolute top-3 right-3 bg-[#F4EFE3]/95 border border-[#CFC5B1] text-[#34483B] font-semibold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                    {video.category}
                  </span>

                  {/* Play Button */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-sm bg-[#34483B]/90 group-hover:bg-[#AD8746] text-[#F4EFE3] flex items-center justify-center transition-colors border border-[#F4EFE3]/30">
                      <FiPlay className="text-xl fill-current ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <h3 className="text-base sm:text-lg font-bold font-serif text-[#34483B] line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs text-[#55594E] line-clamp-2 leading-relaxed">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-[#CFC5B1] flex items-center justify-between text-[11px] text-[#55594E]">
                    <span className="flex items-center gap-1.5">
                      <FiCalendar className="text-[#AD8746] text-xs" />
                      {formatDate(video.createdAt)}
                    </span>
                    <span className="text-[#34483B] font-semibold flex items-center gap-1 group-hover:text-[#AD8746] transition-colors">
                      Watch Video <FiExternalLink className="text-xs" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default VideoGallerySection;
