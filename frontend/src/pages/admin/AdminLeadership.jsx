import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getAdminLeadershipApi, createLeadershipApi, updateLeadershipApi, deleteLeadershipApi } from '../../services/leadershipService';
import { getImageUrl } from '../../services/api';
import { useToast } from '../../hooks/useToast';
import AdminHeader from '../../components/admin/AdminHeader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FiPlus, FiEdit, FiTrash2, FiCheckCircle, FiXCircle } from 'react-icons/fi';

const AdminLeadership = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    designation: 'Principal',
    heading: '',
    message: '',
    location: 'Daudnagar, Bihar',
    displayOrder: 1,
    isActive: true,
    showOnHomepage: true,
    image: null,
  });

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const res = await getAdminLeadershipApi();
      if (res.success && Array.isArray(res.data)) {
        setMembers(res.data);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch leadership members.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleOpenAddModal = () => {
    setEditingMember(null);
    setFormData({
      name: '',
      designation: 'Founder',
      heading: 'Building Strong Foundations',
      message: '',
      location: 'Daudnagar, Bihar',
      displayOrder: members.length + 1,
      isActive: true,
      showOnHomepage: true,
      image: null,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name || '',
      designation: member.designation || '',
      heading: member.heading || '',
      message: member.message || '',
      location: member.location || 'Daudnagar, Bihar',
      displayOrder: member.displayOrder || 1,
      isActive: member.isActive ?? true,
      showOnHomepage: member.showOnHomepage ?? true,
      image: null,
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leadership member?')) return;
    try {
      const res = await deleteLeadershipApi(id);
      if (res.success) {
        addToast('Leadership member deleted successfully!', 'success');
        fetchMembers();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Delete failed.', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);

      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('designation', formData.designation);
      submitData.append('heading', formData.heading);
      submitData.append('message', formData.message);
      submitData.append('location', formData.location);
      submitData.append('displayOrder', formData.displayOrder);
      submitData.append('isActive', formData.isActive);
      submitData.append('showOnHomepage', formData.showOnHomepage);

      if (formData.image) {
        submitData.append('image', formData.image);
      }

      if (editingMember) {
        const res = await updateLeadershipApi(editingMember._id, submitData);
        if (res.success) {
          addToast('Leadership member updated successfully!', 'success');
          setModalOpen(false);
          fetchMembers();
        }
      } else {
        if (!formData.image) {
          addToast('Please select a profile image.', 'error');
          setSubmitting(false);
          return;
        }
        const res = await createLeadershipApi(submitData);
        if (res.success) {
          addToast('Leadership member created successfully!', 'success');
          setModalOpen(false);
          fetchMembers();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save leadership profile.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminHeader
        setMobileOpen={setMobileOpen}
        title="Leadership Team Management"
        subtitle="Manage Founder, Co-Founder, Principal, and leadership profiles displayed on the public homepage."
        action={
          <button
            onClick={handleOpenAddModal}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all"
          >
            <FiPlus className="text-lg" /> Add Leadership Member
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
                  <th className="py-4 px-6">Member Profile</th>
                  <th className="py-4 px-6">Designation</th>
                  <th className="py-4 px-6">Heading & Message</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {members.length > 0 ? (
                  members.map((member) => (
                    <tr key={member._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <span className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 inline-flex items-center justify-center font-mono">
                          #{member.displayOrder}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <img
                            src={getImageUrl(member.image)}
                            alt={member.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-amber-400 bg-slate-100 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block font-serif">{member.name}</span>
                            <span className="text-xs text-slate-500">{member.location}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="bg-amber-100 text-amber-800 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full uppercase">
                          {member.designation}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs">
                        <span className="font-semibold text-slate-900 block truncate">{member.heading}</span>
                        <span className="text-xs text-slate-500 line-clamp-1 italic">"{member.message}"</span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          {member.isActive ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                              <FiCheckCircle /> Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full">
                              <FiXCircle /> Inactive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(member)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit Profile"
                        >
                          <FiEdit className="text-lg" />
                        </button>
                        <button
                          onClick={() => handleDelete(member._id)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Member"
                        >
                          <FiTrash2 className="text-lg" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-8 text-center text-slate-500">
                      No leadership members added yet. Click "Add Leadership Member" above to create one.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <h3 className="text-xl font-bold font-serif text-slate-900">
                {editingMember ? 'Edit Leadership Member' : 'Add New Leadership Member'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-bold text-lg">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Member Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Er. R. P. Singh"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Designation *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.designation}
                    onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                    placeholder="e.g. Founder / Co-Founder / Principal"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Header Quote / Title
                </label>
                <input
                  type="text"
                  value={formData.heading}
                  onChange={(e) => setFormData({ ...formData, heading: e.target.value })}
                  placeholder="e.g. Building Strong Foundations for Tomorrow"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Detailed Message / Address *
                </label>
                <textarea
                  required
                  rows="4"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Enter leadership message..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                ></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="Daudnagar, Bihar"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                    Display Order (ASC) *
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
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase mb-1">
                  Profile Image Upload {editingMember ? '(Optional)' : '*'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Active Status
                </label>

                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showOnHomepage}
                    onChange={(e) => setFormData({ ...formData, showOnHomepage: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  Show on Homepage
                </label>
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
                  {submitting ? 'Saving...' : editingMember ? 'Update Profile' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadership;
