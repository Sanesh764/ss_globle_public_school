import React, { useState, useEffect } from 'react';
import {
  getAdminHeroSlidesApi,
  createHeroSlideApi,
  updateHeroSlideApi,
  deleteHeroSlideApi,
  reorderHeroSlidesApi,
} from '../../services/heroSliderService';
import { getImageUrl } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import AdminHeader from '../../components/admin/AdminHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiCheckCircle,
  FiXCircle,
  FiArrowUp,
  FiArrowDown,
  FiEye,
  FiLayers,
} from 'react-icons/fi';

const AdminHeroSlider = () => {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [previewSlide, setPreviewSlide] = useState(null);
  const [editingSlide, setEditingSlide] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    badge: 'Admissions Open 2026-2027',
    title: 'Welcome to',
    highlightTitle: 'S.S. Global Public School',
    description: 'Providing premier CBSE curriculum with smart classrooms and state-of-the-art facilities.',
    primaryButtonText: 'Apply For Admission',
    primaryButtonLink: '/contact',
    secondaryButtonText: 'Explore School Vision',
    secondaryButtonLink: '/about',
    displayOrder: 1,
    isActive: true,
    autoPlay: true,
    backgroundImage: null,
  });

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const res = await getAdminHeroSlidesApi();
      if (res.success && Array.isArray(res.slides)) {
        setSlides(res.slides);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch hero slides.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSlides();
  }, []);

  const handleOpenAddModal = () => {
    setEditingSlide(null);
    setFormData({
      badge: 'Admissions Open 2026-2027',
      title: 'Welcome to',
      highlightTitle: 'S.S. Global Public School',
      description: '',
      primaryButtonText: 'Apply For Admission',
      primaryButtonLink: '/contact',
      secondaryButtonText: 'Explore School Vision',
      secondaryButtonLink: '/about',
      displayOrder: slides.length + 1,
      isActive: true,
      autoPlay: true,
      backgroundImage: null,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (slide) => {
    setEditingSlide(slide);
    setFormData({
      badge: slide.badge || '',
      title: slide.title || '',
      highlightTitle: slide.highlightTitle || '',
      description: slide.description || '',
      primaryButtonText: slide.primaryButtonText || 'Apply For Admission',
      primaryButtonLink: slide.primaryButtonLink || '/contact',
      secondaryButtonText: slide.secondaryButtonText || 'Explore School Vision',
      secondaryButtonLink: slide.secondaryButtonLink || '/about',
      displayOrder: slide.displayOrder || 1,
      isActive: slide.isActive ?? true,
      autoPlay: slide.autoPlay ?? true,
      backgroundImage: null,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this hero slide?')) return;
    try {
      const res = await deleteHeroSlideApi(id);
      if (res.success) {
        addToast('Hero slide deleted successfully!', 'success');
        fetchSlides();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const handleMoveOrder = async (index, direction) => {
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newSlides.length) return;

    // Swap displayOrder values
    const tempOrder = newSlides[index].displayOrder;
    newSlides[index].displayOrder = newSlides[targetIndex].displayOrder;
    newSlides[targetIndex].displayOrder = tempOrder;

    const orderList = newSlides.map((s) => ({ id: s._id, displayOrder: s.displayOrder }));

    try {
      const res = await reorderHeroSlidesApi(orderList);
      if (res.success) {
        addToast('Slides reordered successfully!', 'success');
        fetchSlides();
      }
    } catch (err) {
      addToast('Reordering failed.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append('badge', formData.badge);
      submitData.append('title', formData.title);
      submitData.append('highlightTitle', formData.highlightTitle);
      submitData.append('description', formData.description);
      submitData.append('primaryButtonText', formData.primaryButtonText);
      submitData.append('primaryButtonLink', formData.primaryButtonLink);
      submitData.append('secondaryButtonText', formData.secondaryButtonText);
      submitData.append('secondaryButtonLink', formData.secondaryButtonLink);
      submitData.append('displayOrder', formData.displayOrder);
      submitData.append('isActive', formData.isActive);
      submitData.append('autoPlay', formData.autoPlay);

      if (formData.backgroundImage) {
        submitData.append('backgroundImage', formData.backgroundImage);
      }

      if (editingSlide) {
        const res = await updateHeroSlideApi(editingSlide._id, submitData);
        if (res.success) {
          addToast('Hero slide updated successfully!', 'success');
          setModalOpen(false);
          fetchSlides();
        }
      } else {
        if (!formData.backgroundImage) {
          addToast('Please select a background image.', 'error');
          setSubmitting(false);
          return;
        }
        const res = await createHeroSlideApi(submitData);
        if (res.success) {
          addToast('Hero slide created successfully!', 'success');
          setModalOpen(false);
          fetchSlides();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save slide.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminHeader
        title="Hero Slider Management"
        subtitle="Manage dynamic front page hero banner slides, titles, badges, buttons, auto-play, and display order."
        action={
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <FiPlus className="text-lg" /> Add New Hero Slide
          </button>
        }
      />

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-slate-900 font-serif font-bold border-b border-slate-200 uppercase text-xs">
                <tr>
                  <th className="py-4 px-6">Order</th>
                  <th className="py-4 px-6">Background Image</th>
                  <th className="py-4 px-6">Slide Content & Heading</th>
                  <th className="py-4 px-6">Buttons & Links</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slides.length > 0 ? (
                  slides.map((slide, idx) => (
                    <tr key={slide._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <div className="flex items-center gap-1.5">
                          <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center justify-center font-mono">
                            #{slide.displayOrder}
                          </span>
                          <div className="flex flex-col gap-0.5">
                            <button
                              disabled={idx === 0}
                              onClick={() => handleMoveOrder(idx, 'up')}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30"
                              title="Move Up"
                            >
                              <FiArrowUp className="text-xs" />
                            </button>
                            <button
                              disabled={idx === slides.length - 1}
                              onClick={() => handleMoveOrder(idx, 'down')}
                              className="p-1 hover:bg-slate-200 rounded text-slate-600 disabled:opacity-30"
                              title="Move Down"
                            >
                              <FiArrowDown className="text-xs" />
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="w-24 h-14 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                          <img
                            src={getImageUrl(slide.backgroundImage)}
                            alt={slide.highlightTitle}
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => setPreviewSlide(slide)}
                            className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity"
                          >
                            <FiEye className="mr-1" /> Preview
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        {slide.badge && (
                          <span className="bg-amber-100 text-amber-800 border border-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider block w-max mb-1">
                            {slide.badge}
                          </span>
                        )}
                        <span className="text-xs text-slate-500 block">{slide.title}</span>
                        <span className="font-bold text-slate-900 block truncate font-serif">{slide.highlightTitle}</span>
                        <span className="text-xs text-slate-500 line-clamp-1 italic">"{slide.description}"</span>
                      </td>
                      <td className="py-4 px-6 text-xs space-y-1">
                        <div>
                          <span className="font-semibold text-slate-800">Primary:</span> {slide.primaryButtonText} ({slide.primaryButtonLink})
                        </div>
                        {slide.secondaryButtonText && (
                          <div>
                            <span className="font-semibold text-slate-800">Secondary:</span> {slide.secondaryButtonText} ({slide.secondaryButtonLink})
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {slide.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <FiCheckCircle /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                              <FiXCircle /> Disabled
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => setPreviewSlide(slide)}
                          className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Preview Slide"
                        >
                          <FiEye className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleOpenEditModal(slide)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Slide"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(slide._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Slide"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No hero slides added yet. Click "Add New Hero Slide" above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Slide Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-serif text-slate-900">
                {editingSlide ? 'Edit Hero Slide' : 'Add New Hero Slide'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Background Image Upload {editingSlide ? '(Optional)' : '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, backgroundImage: e.target.files[0] })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Small Badge
                </label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  placeholder="e.g. Admissions Open 2026-2027"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Main Prefix Heading
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g. Welcome to"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Highlight Heading *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.highlightTitle}
                    onChange={(e) => setFormData({ ...formData, highlightTitle: e.target.value })}
                    placeholder="e.g. S.S. Global Public School"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Slide Description *
                </label>
                <textarea
                  required
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Enter slide description text..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Primary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.primaryButtonText}
                    onChange={(e) => setFormData({ ...formData, primaryButtonText: e.target.value })}
                    placeholder="e.g. Apply For Admission"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Primary Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.primaryButtonLink}
                    onChange={(e) => setFormData({ ...formData, primaryButtonLink: e.target.value })}
                    placeholder="/contact"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Secondary Button Text
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonText}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonText: e.target.value })}
                    placeholder="e.g. Explore School Vision"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Secondary Button Link
                  </label>
                  <input
                    type="text"
                    value={formData.secondaryButtonLink}
                    onChange={(e) => setFormData({ ...formData, secondaryButtonLink: e.target.value })}
                    placeholder="/about"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Active Slide
                  </label>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.autoPlay}
                      onChange={(e) => setFormData({ ...formData, autoPlay: e.target.checked })}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    Auto-Play Slide
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingSlide ? 'Update Slide' : 'Save Hero Slide'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Slide Preview Modal */}
      {previewSlide && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 rounded-3xl max-w-4xl w-full p-6 shadow-2xl border border-slate-800 space-y-4 text-white relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h4 className="font-bold text-lg flex items-center gap-2">
                <FiLayers className="text-amber-400" /> Slide Preview (# {previewSlide.displayOrder})
              </h4>
              <button onClick={() => setPreviewSlide(null)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <div className="relative min-h-[400px] rounded-2xl overflow-hidden flex items-center p-8 bg-cover bg-center"
                 style={{ backgroundImage: `url('${getImageUrl(previewSlide.backgroundImage)}')` }}>
              <div className="absolute inset-0 bg-slate-950/70 z-0"></div>
              <div className="relative z-10 max-w-xl space-y-4">
                {previewSlide.badge && (
                  <span className="inline-block bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-bold px-3 py-1 rounded-full">
                    {previewSlide.badge}
                  </span>
                )}
                <h2 className="text-3xl font-serif font-extrabold text-white">
                  {previewSlide.title} <br />
                  <span className="text-amber-400">{previewSlide.highlightTitle}</span>
                </h2>
                <p className="text-sm text-slate-200">{previewSlide.description}</p>
                <div className="flex gap-3 pt-2">
                  <button className="px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs">
                    {previewSlide.primaryButtonText}
                  </button>
                  {previewSlide.secondaryButtonText && (
                    <button className="px-5 py-2.5 rounded-xl bg-white/20 text-white font-bold text-xs">
                      {previewSlide.secondaryButtonText}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHeroSlider;
