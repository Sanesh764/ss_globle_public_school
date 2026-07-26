import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import GalleryUploadModal from '../../components/admin/GalleryUploadModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useFetch } from '../../hooks/useFetch';
import { useToast } from '../../hooks/useToast';
import { getGalleryApi, uploadGalleryApi, deleteGalleryApi } from '../../services/galleryService';
import { GALLERY_CATEGORIES } from '../../utils/constants';
import { FiPlus, FiTrash2, FiTag } from 'react-icons/fi';

const AdminGallery = () => {
  const { setMobileOpen } = useOutletContext();
  const { addToast } = useToast();

  const [activeCategory, setActiveCategory] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { data, loading, refetch } = useFetch(
    () => getGalleryApi(activeCategory),
    [activeCategory]
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this gallery photo?')) return;
    try {
      const res = await deleteGalleryApi(id);
      if (res.success) {
        addToast('Gallery photo deleted successfully!', 'success');
        refetch();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete photo.', 'error');
    }
  };

  const handleUploadSubmit = async (formData) => {
    try {
      setSubmitting(true);
      const res = await uploadGalleryApi(formData);
      if (res.success) {
        addToast('Photo added to gallery successfully!', 'success');
        setModalOpen(false);
        refetch();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Error uploading photo.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="Manage Photo Gallery" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex flex-wrap gap-2">
            {GALLERY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 shrink-0"
          >
            <FiPlus className="text-lg" /> Upload New Photo
          </button>
        </div>

        {/* Gallery Grid */}
        {loading ? (
          <LoadingSpinner />
        ) : data?.images && data.images.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.images.map((item) => (
              <div
                key={item._id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-200 flex flex-col group card-hover"
              >
                <div className="h-48 overflow-hidden relative bg-slate-100">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-3 left-3 bg-slate-950/80 text-amber-400 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold">
                    {item.category || 'General'}
                  </span>
                </div>

                <div className="p-4 flex items-center justify-between">
                  <h4 className="font-serif font-bold text-slate-900 text-sm line-clamp-1">
                    {item.title}
                  </h4>
                  <button
                    onClick={() => handleDelete(item._id)}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Delete Image"
                  >
                    <FiTrash2 className="text-base" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-500">
            No gallery photos in "{activeCategory}". Click "Upload New Photo" to add one.
          </div>
        )}
      </main>

      {/* Upload Modal */}
      <GalleryUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleUploadSubmit}
        loading={submitting}
      />
    </div>
  );
};

export default AdminGallery;
