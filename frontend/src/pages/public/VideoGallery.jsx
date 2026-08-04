import React, { useState, useEffect, useMemo } from 'react';
import SEO from '../../components/common/SEO';
import PageHeader from '../../components/common/PageHeader';
import { getPublicVideosApi } from '../../services/videoService';
import { formatDate } from '../../utils/formatDate';
import {
  FiPlay,
  FiSearch,
  FiX,
  FiCalendar,
  FiTag,
  FiExternalLink,
  FiYoutube,
  FiFilter,
  FiRefreshCw,
} from 'react-icons/fi';

const CATEGORIES = [
  'All',
  'Academic',
  'Annual Function',
  'Sports',
  'Cultural Program',
  'Independence Day',
  'Republic Day',
  'Classroom Activities',
  'Achievements',
  'Events',
  'Other',
];

const VideoGallery = () => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('featured'); // 'featured', 'newest', 'oldest'

  const fetchVideos = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await getPublicVideosApi({
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        search: searchQuery.trim() !== '' ? searchQuery.trim() : undefined,
      });

      if (res.success && res.data) {
        setVideos(res.data.videos || []);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load video gallery. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, [selectedCategory]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchVideos();
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    fetchVideos();
  };

  // Client-side sorting for instant response
  const sortedVideos = useMemo(() => {
    const list = [...videos];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    // Default 'featured': Featured first, then displayOrder asc, then newest
    return list.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [videos, sortBy]);

  const ogImageUrl = sortedVideos.length > 0 && sortedVideos[0].thumbnail
    ? sortedVideos[0].thumbnail
    : 'https://www.ssglobalpublicschool.com/school.webp';

  return (
    <main className="bg-slate-950 text-white min-h-screen">
      <SEO
        title="Video Gallery | S.S. Global Public School"
        description="Watch official videos of S.S. Global Public School including annual functions, sports events, classroom activities, educational programs, and celebrations."
        keywords="S.S. Global Public School videos, Daudnagar school video gallery, annual function videos Bihar, school events Daudnagar, CBSE school activities"
        canonicalUrl="https://www.ssglobalpublicschool.com/videos"
        ogImage={ogImageUrl}
      />

      <PageHeader
        title="School Video Gallery"
        subtitle="Explore classroom activities, annual functions, sports events, educational programs, celebrations, and inspiring moments from S.S. Global Public School."
        breadcrumb={[{ label: 'Videos' }]}
      />

      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        {/* Search & Sort Controls Bar */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-4 sm:p-6 rounded-3xl shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96 group/search">
              <FiSearch className="absolute left-4 top-3.5 text-slate-400 group-focus-within/search:text-blue-400 transition-colors text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos by title or topic..."
                className="w-full pl-11 pr-10 py-3 bg-slate-950/90 border border-slate-800 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-3 text-slate-400 hover:text-white p-1 rounded-lg"
                >
                  <FiX />
                </button>
              )}
            </form>

            {/* Sort & Quick Filter Indicator */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs text-slate-400 font-semibold hidden sm:inline-flex items-center gap-1">
                <FiFilter className="text-amber-400" /> Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-200 text-xs sm:text-sm font-semibold rounded-xl px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors"
              >
                <option value="featured">Featured & Display Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <button
                onClick={fetchVideos}
                className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white rounded-xl transition-colors shrink-0"
                title="Refresh Videos"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Category Filter Pills (Horizontal Scrollable) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none pt-2 border-t border-slate-800/80">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-600/30 scale-105'
                    : 'bg-slate-950/80 hover:bg-slate-800 text-slate-300 border border-slate-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-2xl text-center text-sm font-semibold">
            {error}
          </div>
        )}

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
                  <div className="w-4/5 h-3 bg-slate-800/60 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedVideos.length === 0 ? (
          /* Empty State */
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-12 text-center space-y-4 max-w-xl mx-auto shadow-xl">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-400/30 text-amber-400 flex items-center justify-center mx-auto text-3xl">
              <FiYoutube />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-white">No Videos Found</h3>
              <p className="text-slate-400 text-sm">
                No videos match your selected category or search keywords yet.
              </p>
            </div>
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all"
              >
                Clear Filters & Reset
              </button>
            )}
          </div>
        ) : (
          /* Video Cards Grid Layout (3 on Desktop, 2 on Tablet, 1 on Mobile) */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {sortedVideos.map((video) => (
              <a
                key={video._id}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-slate-800/90 overflow-hidden shadow-xl shadow-blue-950/20 hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-1.5 flex flex-col justify-between"
              >
                {/* Thumbnail Container with Play Overlay */}
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
                      Featured Video
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

                  {/* Redirect External Link Icon */}
                  <div className="absolute bottom-3 right-3 text-slate-300 text-xs opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-700">
                    <span>Watch on YouTube</span>
                    <FiExternalLink />
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
      </section>
    </main>
  );
};

export default VideoGallery;
