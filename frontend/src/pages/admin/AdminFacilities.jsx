import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { useToast } from '../../hooks/useToast';
import { getAdminFacilitiesApi, createFacilityApi, updateFacilityApi, deleteFacilityApi } from '../../services/facilityService';
import { getImageUrl } from '../../services/api';
import {
  FiCheckSquare,
  FiPlus,
  FiEdit,
  FiTrash2,
  FiUploadCloud,
  FiCheckCircle,
  FiX,
  FiRefreshCw,
  FiZap,
  FiCpu,
  FiBookOpen,
  FiActivity,
  FiShield,
  FiMonitor,
} from 'react-icons/fi';

const ICON_OPTIONS = [
  { label: 'Monitor / Smart Class (FiMonitor)', value: 'FiMonitor' },
  { label: 'Science / Practical (FiZap)', value: 'FiZap' },
  { label: 'Computer / Tech (FiCpu)', value: 'FiCpu' },
  { label: 'Library / Books (FiBookOpen)', value: 'FiBookOpen' },
  { label: 'Sports / Athletics (FiActivity)', value: 'FiActivity' },
  { label: 'Safety / Security (FiShield)', value: 'FiShield' },
  { label: 'General / Check (FiCheckCircle)', value: 'FiCheckCircle' },
];

const AdminFacilities = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const { addToast } = useToast();

  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    shortDescription: '',
    detailedDescription: '',
    icon: 'FiCheckCircle',
    displayOrder: 0,
    isActive: true,
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchFacilities = async () => {
    try {
      setLoading(true);
      const res = await getAdminFacilitiesApi();
      const list = res?.data?.facilities || res?.facilities || [];
      setFacilities(list);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch facilities', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        title: item.title || '',
        shortDescription: item.shortDescription || '',
        detailedDescription: item.detailedDescription || '',
        icon: item.icon || 'FiCheckCircle',
        displayOrder: item.displayOrder || 0,
        isActive: item.isActive !== undefined ? item.isActive : true,
      });
      setImageFile(null);
    } else {
      setEditingItem(null);
      setFormData({
        title: '',
        shortDescription: '',
        detailedDescription: '',
        icon: 'FiCheckCircle',
        displayOrder: facilities.length + 1,
        isActive: true,
      });
      setImageFile(null);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      addToast('Facility title is required.', 'error');
      return;
    }

    if (!formData.shortDescription.trim()) {
      addToast('Short description is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();
      dataToSubmit.append('title', formData.title);
      dataToSubmit.append('shortDescription', formData.shortDescription);
      dataToSubmit.append('detailedDescription', formData.detailedDescription);
      dataToSubmit.append('icon', formData.icon);
      dataToSubmit.append('displayOrder', formData.displayOrder);
      dataToSubmit.append('isActive', formData.isActive);

      if (imageFile) {
        dataToSubmit.append('image', imageFile);
      }

      if (editingItem) {
        await updateFacilityApi(editingItem._id, dataToSubmit);
        addToast('Facility updated successfully!', 'success');
      } else {
        await createFacilityApi(dataToSubmit);
        addToast('Facility created successfully!', 'success');
      }

      handleCloseModal();
      fetchFacilities();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmItem) return;
    try {
      await deleteFacilityApi(deleteConfirmItem._id);
      addToast('Facility deleted successfully!', 'success');
      setDeleteConfirmItem(null);
      fetchFacilities();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete facility', 'error');
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="Campus Facilities Manager" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <FiCheckSquare className="text-blue-600" /> Manage Campus Facilities
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Add, edit, reorder, or upload images for modern campus facilities visible on Homepage and Facilities page.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <FiPlus className="text-lg" /> Add Facility
          </button>
        </div>

        {/* Facilities Table */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center">
            <FiRefreshCw className="animate-spin text-3xl text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading campus facilities...</p>
          </div>
        ) : facilities.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-4 text-center">Order</th>
                    <th className="py-4 px-6">Facility</th>
                    <th className="py-4 px-6">Short Description</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {facilities.map((fac) => (
                    <tr key={fac._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-4 text-center font-bold text-slate-500">
                        #{fac.displayOrder}
                      </td>

                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          {fac.image ? (
                            <img
                              src={getImageUrl(fac.image)}
                              alt={fac.title}
                              className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-bold border border-blue-100">
                              <FiCheckSquare />
                            </div>
                          )}
                          <div>
                            <h4 className="font-bold font-serif text-slate-900 text-sm">{fac.title}</h4>
                            <span className="text-[11px] text-slate-400 font-mono">Icon: {fac.icon}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6 max-w-sm">
                        <p className="text-xs text-slate-600 line-clamp-2">{fac.shortDescription}</p>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            fac.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {fac.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenModal(fac)}
                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                            title="Edit Facility"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmItem(fac)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Facility"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center max-w-md mx-auto space-y-3">
            <FiCheckSquare className="text-4xl text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold font-serif text-slate-800">No Facilities Added</h3>
            <p className="text-xs text-slate-500">
              Click Add Facility above to create modern campus facilities.
            </p>
          </div>
        )}
      </main>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="primary-gradient text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                <FiCheckSquare /> {editingItem ? 'Edit Facility' : 'Add New Campus Facility'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-white/80 hover:text-white rounded-full">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Facility Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Smart Classrooms"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Icon Style
                </label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Short Description * (Displayed on Homepage)
                </label>
                <textarea
                  rows="2"
                  required
                  value={formData.shortDescription}
                  onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                  placeholder="Brief overview of facility..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Detailed Description (Displayed on Facilities Page)
                </label>
                <textarea
                  rows="3"
                  value={formData.detailedDescription}
                  onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
                  placeholder="Full detailed information..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: e.target.value })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Status
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="true">Active (Visible)</option>
                    <option value="false">Inactive (Hidden)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Facility Image (Optional)
                </label>
                <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                  <FiUploadCloud className="text-3xl text-blue-600 mx-auto" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files[0])}
                    className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {imageFile ? (
                    <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                      <FiCheckCircle /> Selected: {imageFile.name}
                    </p>
                  ) : editingItem?.image ? (
                    <p className="text-xs text-slate-500">Current Image Attached</p>
                  ) : null}
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : editingItem ? 'Save Changes' : 'Create Facility'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              <FiTrash2 />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Delete Campus Facility?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete <strong className="text-slate-900">"{deleteConfirmItem.title}"</strong>?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmItem(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminFacilities;
