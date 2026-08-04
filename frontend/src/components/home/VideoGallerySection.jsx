import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPublicVideosApi } from '../../services/videoService';
import { formatDate } from '../../utils/formatDate';
import { FiPlay, FiArrowRight, FiVideo, FiCalendar, FiTag, FiExternalLink } from 'react-icons/fi';

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
    return null; // Hide section cleanly if no videos are configured
  }

  return (
    <section className="py-20 bg-slate-950 text-white relative overflow-hidden border-t border-slate-800 font-sans">
      {/* Background Radial Blur Glows */}
      <div className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-800/80 pb-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
              <FiVideo className="text-amber-400" /> Inspiring Moments
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold font-serif text-white tracking-tight">
              School Video Gallery
            </h2>
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              Explore classroom activities, annual functions, sports events, educational programs, celebrations, and inspiring moments from S.S. Global Public School.
            </p>
          </div>

          <Link
            to="/videos"
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-extrabold text-sm shadow-xl shadow-amber-500/20 transition-all duration-300 transform hover:-translate-y-0.5 shrink-0 group"
          >
            <span>View All Videos</span>
            <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-slate-900/60 rounded-3xl border border-slate-800/80 overflow-hidden shadow-xl animate-pulse space-y-4 p-4"
              >
                <div className="w-full h-48 bg-slate-800 rounded-2xl" />
                <div className="space-y-2">
                  <div className="w-2/3 h-4 bg-slate-800 rounded" />
                  <div className="w-full h-3 bg-slate-800/80 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Video Cards Grid (3 Columns Desktop, 2 Tablet, 1 Mobile) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {videos.slice(0, 6).map((video) => (
              <a
                key={video._id}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-xl shadow-blue-950/20 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-video w-full overflow-hidden bg-slate-950">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = '/school.webp';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

                  {/* Featured Tag Pill */}
                  {video.isFeatured && (
                    <span className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 font-extrabold text-[10px] uppercase tracking-wider px-3 py-1 rounded-full shadow-lg backdrop-blur-md">
                      Featured
                    </span>
                  )}

                  {/* Category Pill */}
                  <span className="absolute top-3 right-3 bg-slate-950/80 backdrop-blur-md border border-slate-700/80 text-amber-300 font-semibold text-[11px] px-3 py-1 rounded-full flex items-center gap-1">
                    <FiTag className="text-amber-400 text-xs" /> {video.category}
                  </span>

                  {/* Play Icon Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-14 h-14 rounded-full bg-red-600/90 text-white flex items-center justify-center shadow-2xl shadow-red-600/50 group-hover:scale-110 group-hover:bg-red-500 transition-all duration-300 pl-0.5 border border-red-400/40">
                      <FiPlay className="text-2xl fill-current" />
                    </div>
                  </div>
                </div>

                {/* Content Details */}
                <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold font-serif text-white group-hover:text-blue-400 transition-colors line-clamp-2 leading-snug">
                      {video.title}
                    </h3>
                    {video.description && (
                      <p className="text-xs sm:text-sm text-slate-300 line-clamp-2 leading-relaxed font-light">
                        {video.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="flex items-center gap-1.5 font-medium">
                      <FiCalendar className="text-amber-400 text-xs" />
                      {formatDate(video.createdAt)}
                    </span>
                    <span className="text-blue-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                      Play Video <FiExternalLink className="text-xs" />
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
