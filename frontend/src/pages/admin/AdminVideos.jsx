import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import SearchBar from '../../components/common/SearchBar';
import Pagination from '../../components/common/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useToast } from '../../hooks/useToast';
import {
  getAdminVideosApi,
  getVideoStatsApi,
  createVideoApi,
  updateVideoApi,
  deleteVideoApi,
  toggleVideoStatusApi,
  toggleVideoFeaturedApi,
  bulkDeleteVideosApi,
  bulkUpdateVideoStatusApi,
  reorderVideosApi,
} from '../../services/videoService';
import { formatDate } from '../../utils/formatDate';
import { extractYouTubeId, generateYouTubeThumbnail, isValidYouTubeUrl } from '../../utils/youtube';
import {
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiVideo,
  FiCheckCircle,
  FiXCircle,
  FiStar,
  FiCopy,
  FiEye,
  FiX,
  FiFilter,
  FiTrendingUp,
  FiCalendar,
  FiRefreshCw,
  FiCheck,
  FiExternalLink,
  FiTag,
  FiLayers,
} from 'react-icons/fi';

const CATEGORIES = [
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

const AdminVideos = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const { addToast } = useToast();

  const [videos, setVideos] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState('All');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Bulk Selection
  const [selectedIds, setSelectedIds] = useState([]);

  // Modals
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmBulkDelete, setConfirmBulkDelete] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: 'Events',
    displayOrder: 0,
    isActive: true,
    isFeatured: false,
  });

  // Real-time extracted YouTube details for form preview
  const extractedId = extractYouTubeId(formData.youtubeUrl);
  const liveThumbnail = extractedId ? generateYouTubeThumbnail(extractedId) : '';
  const isUrlValid = formData.youtubeUrl.trim() === '' || isValidYouTubeUrl(formData.youtubeUrl);

  const fetchVideosAndStats = async () => {
    try {
      setLoading(true);
      const [videosRes, statsRes] = await Promise.all([
        getAdminVideosApi({
          page,
          search,
          category: categoryFilter,
          status: statusFilter,
          isFeatured: featuredFilter,
          limit: 10,
        }),
        getVideoStatsApi(),
      ]);

      if (videosRes.success && videosRes.data) {
        setVideos(videosRes.data.videos || []);
        setTotalPages(videosRes.data.pagination?.totalPages || 1);
      }

      if (statsRes.success && statsRes.data) {
        setStats(statsRes.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to load videos.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideosAndStats();
  }, [page, search, categoryFilter, statusFilter, featuredFilter]);

  const handleOpenAddModal = () => {
    setEditingVideo(null);
    setFormData({
      title: '',
      description: '',
      youtubeUrl: '',
      category: 'Events',
      displayOrder: videos.length + 1,
      isActive: true,
      isFeatured: false,
    });
    setFormModalOpen(true);
  };

  const handleOpenEditModal = (video) => {
    setEditingVideo(video);
    setFormData({
      title: video.title || '',
      description: video.description || '',
      youtubeUrl: video.youtubeUrl || '',
      category: video.category || 'Events',
      displayOrder: video.displayOrder || 0,
      isActive: Boolean(video.isActive),
      isFeatured: Boolean(video.isFeatured),
    });
    setFormModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast('Video title is required.', 'warning');
      return;
    }

    if (!isValidYouTubeUrl(formData.youtubeUrl)) {
      addToast('Please enter a valid YouTube video URL.', 'warning');
      return;
    }

    try {
      setSubmitting(true);
      if (editingVideo) {
        const res = await updateVideoApi(editingVideo._id, formData);
        if (res.success) {
          addToast('Video updated successfully!', 'success');
          setFormModalOpen(false);
          fetchVideosAndStats();
        }
      } else {
        const res = await createVideoApi(formData);
        if (res.success) {
          addToast('New video added to gallery successfully!', 'success');
          setFormModalOpen(false);
          fetchVideosAndStats();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save video.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSingle = async () => {
    if (!confirmDeleteId) return;
    try {
      const res = await deleteVideoApi(confirmDeleteId);
      if (res.success) {
        addToast('Video deleted successfully!', 'success');
        setConfirmDeleteId(null);
        setSelectedIds((prev) => prev.filter((id) => id !== confirmDeleteId));
        fetchVideosAndStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete video.', 'error');
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await toggleVideoStatusApi(id);
      if (res.success) {
        addToast(res.message || 'Status updated!', 'success');
        fetchVideosAndStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update status.', 'error');
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      const res = await toggleVideoFeaturedApi(id);
      if (res.success) {
        addToast(res.message || 'Featured status updated!', 'success');
        fetchVideosAndStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update featured status.', 'error');
    }
  };

  const handleCopyLink = (url) => {
    navigator.clipboard.writeText(url);
    addToast('YouTube video link copied to clipboard!', 'info');
  };

  // Bulk Actions
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(videos.map((v) => v._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleExecuteBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      const res = await bulkDeleteVideosApi(selectedIds);
      if (res.success) {
        addToast(`Successfully deleted ${res.data?.deletedCount || selectedIds.length} video(s)!`, 'success');
        setSelectedIds([]);
        setConfirmBulkDelete(false);
        fetchVideosAndStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed bulk delete operation.', 'error');
    }
  };

  const handleExecuteBulkStatus = async (statusBool) => {
    if (selectedIds.length === 0) return;
    try {
      const res = await bulkUpdateVideoStatusApi(selectedIds, statusBool);
      if (res.success) {
        addToast(`Updated status for ${res.data?.modifiedCount || selectedIds.length} video(s)!`, 'success');
        setSelectedIds([]);
        fetchVideosAndStats();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed bulk status update.', 'error');
    }
  };

  const handleOrderChange = async (id, newOrder) => {
    try {
      const res = await reorderVideosApi([{ id, displayOrder: newOrder }]);
      if (res.success) {
        setVideos((prev) =>
          prev.map((v) => (v._id === id ? { ...v, displayOrder: Number(newOrder) } : v))
        );
      }
    } catch (err) {
      addToast('Failed to update display order.', 'error');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-12 font-sans">
      <AdminHeader setMobileOpen={setMobileOpen} title="Video Gallery Management" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Dashboard Statistics Overview Cards */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl font-bold">
                <FiVideo />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Videos</span>
                <h3 className="text-2xl font-extrabold font-serif text-slate-900">{stats.totalVideos || 0}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl font-bold">
                <FiCheckCircle />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Public</span>
                <h3 className="text-2xl font-extrabold font-serif text-slate-900">{stats.activeVideos || 0}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-2xl font-bold">
                <FiTrendingUp />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Added This Month</span>
                <h3 className="text-2xl font-extrabold font-serif text-slate-900">{stats.addedThisMonth || 0}</h3>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl font-bold">
                <FiXCircle />
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Inactive Hidden</span>
                <h3 className="text-2xl font-extrabold font-serif text-slate-900">{stats.inactiveVideos || 0}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Control Bar: Search, Filters, Bulk Actions, Add Button */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="w-full lg:w-80">
              <SearchBar
                value={search}
                onChange={(val) => {
                  setSearch(val);
                  setPage(1);
                }}
                onClear={() => setSearch('')}
                placeholder="Search title, category, description..."
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => {
                  setCategoryFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="All">All Statuses</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>

              <select
                value={featuredFilter}
                onChange={(e) => {
                  setFeaturedFilter(e.target.value);
                  setPage(1);
                }}
                className="bg-slate-50 border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:border-blue-500"
              >
                <option value="All">Featured & Standard</option>
                <option value="true">Featured Only</option>
              </select>

              <button
                onClick={fetchVideosAndStats}
                className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0 border border-slate-300"
                title="Refresh Table"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              </button>
            </div>

            {/* Add New Video Action */}
            <button
              onClick={handleOpenAddModal}
              className="w-full lg:w-auto px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              <FiPlus className="text-lg" /> Add YouTube Video
            </button>
          </div>

          {/* Bulk Action Bar (Visible when items are checked) */}
          {selectedIds.length > 0 && (
            <div className="bg-slate-900 text-white p-3 px-4 rounded-xl flex items-center justify-between gap-4 animate-in fade-in duration-200">
              <span className="text-xs font-bold text-amber-300">
                {selectedIds.length} video(s) selected
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExecuteBulkStatus(true)}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <FiCheck className="text-xs" /> Set Active
                </button>
                <button
                  onClick={() => handleExecuteBulkStatus(false)}
                  className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-200 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <FiX className="text-xs" /> Set Inactive
                </button>
                <button
                  onClick={() => setConfirmBulkDelete(true)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                >
                  <FiTrash2 className="text-xs" /> Bulk Delete
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Main Videos Data Table */}
        {loading ? (
          <LoadingSpinner />
        ) : videos.length > 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-900 text-slate-200 uppercase text-[11px] tracking-wider font-bold">
                  <tr>
                    <th className="px-4 py-4 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={videos.length > 0 && selectedIds.length === videos.length}
                        onChange={handleSelectAll}
                        className="rounded border-slate-700 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                    <th className="px-4 py-4">Thumbnail</th>
                    <th className="px-6 py-4">Title & Details</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4 text-center">Order</th>
                    <th className="px-4 py-4 text-center">Featured</th>
                    <th className="px-4 py-4 text-center">Status</th>
                    <th className="px-6 py-4">Added Date</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {videos.map((video) => (
                    <tr key={video._id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Select Checkbox */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(video._id)}
                          onChange={() => handleToggleSelect(video._id)}
                          className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>

                      {/* Thumbnail & YouTube Quick Trigger */}
                      <td className="px-4 py-4">
                        <div className="relative w-24 aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 shadow-xs group">
                          <img
                            src={video.thumbnail}
                            alt={video.title}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setPreviewVideo(video)}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-lg"
                            title="Preview Video"
                          >
                            <FiEye />
                          </button>
                        </div>
                      </td>

                      {/* Title & Description */}
                      <td className="px-6 py-4 max-w-xs sm:max-w-md">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 font-serif block text-sm">
                            {video.title}
                          </span>
                        </div>
                        {video.description && (
                          <p className="text-xs text-slate-500 line-clamp-1 mt-0.5 font-light">
                            {video.description}
                          </p>
                        )}
                        <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                          ID: {video.youtubeVideoId}
                        </span>
                      </td>

                      {/* Category Badge */}
                      <td className="px-4 py-4">
                        <span className="bg-blue-50 text-blue-700 border border-blue-200 font-bold px-2.5 py-1 rounded-lg text-xs whitespace-nowrap inline-flex items-center gap-1">
                          <FiTag className="text-blue-500 text-[10px]" /> {video.category}
                        </span>
                      </td>

                      {/* Display Order Input */}
                      <td className="px-4 py-4 text-center">
                        <input
                          type="number"
                          value={video.displayOrder}
                          onChange={(e) => handleOrderChange(video._id, e.target.value)}
                          className="w-14 text-center bg-slate-50 border border-slate-300 rounded-lg py-1 text-xs font-bold focus:outline-none focus:border-blue-500"
                        />
                      </td>

                      {/* Featured Toggle */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleFeatured(video._id)}
                          className={`p-2 rounded-xl transition-all ${
                            video.isFeatured
                              ? 'bg-amber-100 text-amber-600 hover:bg-amber-200'
                              : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                          }`}
                          title={video.isFeatured ? 'Featured on Homepage (Click to unset)' : 'Mark as Homepage Featured'}
                        >
                          <FiStar className={`text-base ${video.isFeatured ? 'fill-current' : ''}`} />
                        </button>
                      </td>

                      {/* Active Status Toggle Switch */}
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(video._id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            video.isActive
                              ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {video.isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        {formatDate(video.createdAt)}
                      </td>

                      {/* Action Icons */}
                      <td className="px-6 py-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleCopyLink(video.youtubeUrl)}
                          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Copy YouTube Link"
                        >
                          <FiCopy className="text-base" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(video)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Video Details"
                        >
                          <FiEdit2 className="text-base" />
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(video._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Video"
                        >
                          <FiTrash2 className="text-base" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-slate-100">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          </div>
        ) : (
          /* Empty State */
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 space-y-3">
            <FiVideo className="text-4xl text-slate-400 mx-auto" />
            <h4 className="text-lg font-bold text-slate-800 font-serif">No videos available yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Add your official YouTube video links to showcase school events, functions, and activities.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-sm hover:bg-blue-700 transition-colors"
            >
              <FiPlus /> Add First Video
            </button>
          </div>
        )}
      </main>

      {/* Add / Edit Video Modal */}
      {formModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 space-y-6 relative my-8 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold font-serif text-slate-900">
                  {editingVideo ? 'Edit Video Details' : 'Add New YouTube Video'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Paste the YouTube video link. Thumbnails and video IDs are extracted automatically.
                </p>
              </div>
              <button
                onClick={() => setFormModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {/* YouTube URL input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  YouTube Video URL *
                </label>
                <input
                  type="url"
                  required
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  placeholder="https://www.youtube.com/watch?v=XXXXX or https://youtu.be/XXXXX"
                  className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 transition-all ${
                    !isUrlValid
                      ? 'border-rose-400 focus:ring-rose-500/20'
                      : 'border-slate-300 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                />
                {!isUrlValid && (
                  <p className="text-xs text-rose-600 font-semibold mt-1">
                    Invalid YouTube URL format. Please paste a valid YouTube video link.
                  </p>
                )}
              </div>

              {/* Instant Live Thumbnail Preview */}
              {liveThumbnail && (
                <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 space-y-2">
                  <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                    <FiEye /> Automatic Thumbnail Preview
                  </span>
                  <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                    <img
                      src={liveThumbnail}
                      alt="Thumbnail Preview"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] text-slate-300 font-mono">
                      ID: {extractedId}
                    </div>
                  </div>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Video Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter descriptive video title"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Description / Highlights (Optional)
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Short description of the event or activity featured in the video..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Category & Display Order Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500 font-semibold"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Checkbox Toggles */}
              <div className="flex flex-wrap gap-6 pt-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                  />
                  <span>Active on Public Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                  />
                  <span>Mark as Featured (Shown first)</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting || !isUrlValid}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting ? 'Saving Video...' : (editingVideo ? 'Save Changes' : 'Publish Video')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-800 space-y-4 relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-serif font-bold text-lg text-white">{previewVideo.title}</h4>
              <button
                onClick={() => setPreviewVideo(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <FiX className="text-xl" />
              </button>
            </div>

            {/* Embedded YouTube Iframe Preview */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-inner">
              <iframe
                src={`https://www.youtube.com/embed/${previewVideo.youtubeVideoId}?autoplay=1`}
                title={previewVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex justify-between items-center text-xs text-slate-400 pt-1">
              <span>Category: <strong className="text-amber-300">{previewVideo.category}</strong></span>
              <a
                href={previewVideo.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline flex items-center gap-1 font-semibold"
              >
                Open in YouTube <FiExternalLink />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Single Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              <FiTrash2 />
            </div>
            <div>
              <h4 className="text-lg font-bold font-serif text-slate-900">Confirm Video Deletion</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to remove this video from the school gallery? This action cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSingle}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {confirmBulkDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              <FiLayers />
            </div>
            <div>
              <h4 className="text-lg font-bold font-serif text-slate-900">Bulk Delete {selectedIds.length} Videos</h4>
              <p className="text-xs text-slate-500 mt-1">
                Are you sure you want to delete all {selectedIds.length} selected videos? This operation cannot be undone.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setConfirmBulkDelete(false)}
                className="px-5 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteBulkDelete}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-colors"
              >
                Confirm Bulk Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminVideos;
