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
  const [sortBy, setSortBy] = useState('featured');

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

  const sortedVideos = useMemo(() => {
    const list = [...videos];
    if (sortBy === 'newest') {
      return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    if (sortBy === 'oldest') {
      return list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }
    return list.sort((a, b) => {
      if (a.isFeatured !== b.isFeatured) return b.isFeatured ? 1 : -1;
      if (a.displayOrder !== b.displayOrder) return a.displayOrder - b.displayOrder;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [videos, sortBy]);

  const ogImageUrl =
    sortedVideos.length > 0 && sortedVideos[0].thumbnail
      ? sortedVideos[0].thumbnail
      : 'https://www.ssglobalpublicschool.com/school.webp';

  return (
    <main className="bg-[#F4EFE3] text-[#252821] min-h-screen">
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
        {/* Search & Sort Controls */}
        <div className="bg-[#EBE2CC] border border-[#CFC5B1] p-4 sm:p-6 rounded-sm space-y-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <form onSubmit={handleSearchSubmit} className="relative w-full md:w-96">
              <FiSearch className="absolute left-3.5 top-3.5 text-[#55594E] text-base" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search videos by title or topic..."
                className="w-full pl-10 pr-10 py-2.5 bg-[#F4EFE3] border border-[#CFC5B1] rounded-sm text-sm text-[#252821] placeholder-[#55594E]/70 focus:outline-none focus:border-[#34483B] transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-2.5 text-[#55594E] hover:text-[#252821] p-1"
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </form>

            <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
              <span className="text-xs text-[#55594E] font-semibold hidden sm:inline-flex items-center gap-1.5">
                <FiFilter className="text-[#AD8746]" /> Sort By:
              </span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-[#F4EFE3] border border-[#CFC5B1] text-[#252821] text-xs sm:text-sm font-medium rounded-sm px-3.5 py-2.5 focus:outline-none focus:border-[#34483B]"
              >
                <option value="featured">Featured &amp; Display Order</option>
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
              </select>
              <button
                onClick={fetchVideos}
                className="p-2.5 bg-[#F4EFE3] hover:bg-[#DED5C1] border border-[#CFC5B1] text-[#34483B] rounded-sm transition-colors shrink-0"
                title="Refresh Videos"
                aria-label="Refresh Videos"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-3 border-t border-[#CFC5B1]">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-colors shrink-0 border ${
                  selectedCategory === cat
                    ? 'bg-[#34483B] text-[#F4EFE3] border-[#34483B]'
                    : 'bg-[#F4EFE3] hover:bg-[#DED5C1] text-[#252821] border-[#CFC5B1]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="bg-[#7F2E2E]/10 border border-[#7F2E2E]/30 text-[#7F2E2E] p-4 rounded-sm text-center text-sm font-semibold">
            {error}
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-[#EBE2CC] rounded-sm border border-[#CFC5B1] overflow-hidden animate-pulse space-y-4 p-4">
                <div className="w-full h-44 bg-[#DED5C1]" />
                <div className="space-y-2">
                  <div className="w-2/3 h-4 bg-[#DED5C1]" />
                  <div className="w-full h-3 bg-[#DED5C1]" />
                </div>
              </div>
            ))}
          </div>
        ) : sortedVideos.length === 0 ? (
          <div className="bg-[#EBE2CC] border border-[#CFC5B1] rounded-sm p-12 text-center space-y-4 max-w-xl mx-auto">
            <div className="w-14 h-14 rounded-sm bg-[#F4EFE3] border border-[#CFC5B1] text-[#AD8746] flex items-center justify-center mx-auto text-2xl">
              <FiYoutube />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold font-serif text-[#34483B]">No Videos Found</h3>
              <p className="text-[#55594E] text-sm">
                No videos match your selected category or search keywords yet.
              </p>
            </div>
            {(selectedCategory !== 'All' || searchQuery) && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSearchQuery('');
                }}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] font-semibold text-xs rounded-sm transition-colors"
              >
                Clear Filters &amp; Reset
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedVideos.map((video) => (
              <a
                key={video._id}
                href={video.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-[#EBE2CC]/55 rounded-sm border border-[#CFC5B1] hover:border-[#AD8746] overflow-hidden transition-colors flex flex-col justify-between"
              >
                <div className="relative aspect-video w-full overflow-hidden bg-[#DED5C1] border-b border-[#CFC5B1]">
                  <img
                    src={video.thumbnail}
                    alt={video.title}
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
                      Featured Video
                    </span>
                  )}

                  <span className="absolute top-3 right-3 bg-[#F4EFE3]/95 border border-[#CFC5B1] text-[#34483B] font-semibold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-sm">
                    {video.category}
                  </span>

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
