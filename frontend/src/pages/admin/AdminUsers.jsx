import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { useToast } from '../../hooks/useToast';
import {
  getStaffAdminsApi,
  createStaffAdminApi,
  updateStaffAdminApi,
  resetStaffAdminPasswordApi,
  deleteStaffAdminApi,
} from '../../services/authService';
import { formatDate } from '../../utils/formatDate';
import {
  FiUsers,
  FiUserPlus,
  FiEdit,
  FiTrash2,
  FiKey,
  FiShield,
  FiX,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
} from 'react-icons/fi';

const AdminUsers = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const { addToast } = useToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [resetPasswordUser, setResetPasswordUser] = useState(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Create / Edit
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    password: '',
    role: 'staff',
    isActive: true,
  });

  // Form State for Password Reset Modal
  const [resetPasswordData, setResetPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getStaffAdminsApi();
      const list = res?.data?.users || res?.users || [];
      setUsers(list);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch staff accounts', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name || '',
        username: user.username || (user.email ? user.email.split('@')[0] : ''),
        email: user.email || '',
        password: '',
        role: user.role || 'staff',
        isActive: user.isActive !== undefined ? user.isActive : true,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        username: '',
        email: '',
        password: '',
        role: 'staff',
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      addToast('Full name is required.', 'error');
      return;
    }
    if (!formData.email.trim()) {
      addToast('Email address is required.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      if (editingUser) {
        await updateStaffAdminApi(editingUser._id, {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          role: formData.role,
          isActive: formData.isActive,
        });
        addToast('Staff account updated successfully!', 'success');
      } else {
        if (!formData.password || formData.password.length < 8) {
          addToast('Password must be at least 8 characters long.', 'error');
          setSubmitting(false);
          return;
        }
        await createStaffAdminApi(formData);
        addToast('Staff account created successfully!', 'success');
      }

      handleCloseModal();
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();

    if (!resetPasswordData.newPassword || resetPasswordData.newPassword.length < 8) {
      addToast('Password must be at least 8 characters long.', 'error');
      return;
    }
    if (resetPasswordData.newPassword !== resetPasswordData.confirmPassword) {
      addToast('New password and Confirm password do not match.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      await resetStaffAdminPasswordApi(
        resetPasswordUser._id,
        resetPasswordData.newPassword,
        resetPasswordData.confirmPassword
      );
      addToast(`Password reset successfully for ${resetPasswordUser.name}!`, 'success');
      setResetPasswordUser(null);
      setResetPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to reset password', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    try {
      await updateStaffAdminApi(user._id, {
        isActive: !user.isActive,
      });
      addToast(
        `Staff account ${!user.isActive ? 'enabled' : 'disabled'} successfully!`,
        'success'
      );
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to toggle account status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmUser) return;
    try {
      await deleteStaffAdminApi(deleteConfirmUser._id);
      addToast('Staff account deleted permanently!', 'success');
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete user', 'error');
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="Staff Users & Accounts Management" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <FiUsers className="text-blue-600" /> Manage Staff Accounts
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Create, edit, reset passwords, or enable/disable access permissions for staff accounts.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2 shrink-0 active:scale-95"
          >
            <FiUserPlus className="text-lg" /> Create Staff Account
          </button>
        </div>

        {/* Users Table */}
        {loading ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center">
            <FiRefreshCw className="animate-spin text-3xl text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading staff user accounts...</p>
          </div>
        ) : users.length > 0 ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <th className="py-4 px-6">Name</th>
                    <th className="py-4 px-4">Username</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-4 text-center">Role</th>
                    <th className="py-4 px-4 text-center">Status</th>
                    <th className="py-4 px-4">Created Date</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {users.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-base font-bold border border-blue-100 shrink-0">
                            {u.name ? u.name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <h4 className="font-bold font-serif text-slate-900 text-sm">{u.name}</h4>
                            <span className="text-[11px] text-slate-400">ID: {u._id.slice(-6)}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono text-xs font-bold text-slate-800">
                        {u.username || u.email.split('@')[0]}
                      </td>

                      <td className="py-4 px-6 font-mono text-xs text-slate-600">
                        {u.email}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            u.role === 'superadmin' || u.role === 'admin'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {u.role === 'superadmin' ? 'Super Admin' : 'Staff Admin'}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(u)}
                          title="Click to toggle account status"
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-transform active:scale-95 ${
                            u.isActive !== false
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                          }`}
                        >
                          {u.isActive !== false ? <FiCheckCircle /> : <FiXCircle />}
                          {u.isActive !== false ? 'Active' : 'Disabled'}
                        </button>
                      </td>

                      <td className="py-4 px-4 text-xs text-slate-500">
                        {formatDate(u.createdAt)}
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              setResetPasswordUser(u);
                              setResetPasswordData({ newPassword: '', confirmPassword: '' });
                            }}
                            className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-colors"
                            title="Reset Password"
                          >
                            <FiKey />
                          </button>
                          <button
                            onClick={() => handleOpenModal(u)}
                            className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-colors"
                            title="Edit Staff Member"
                          >
                            <FiEdit />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmUser(u)}
                            className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                            title="Delete Account"
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
            <FiUsers className="text-4xl text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold font-serif text-slate-800">No Staff Accounts Created</h3>
            <p className="text-xs text-slate-500">
              Create staff user accounts to give teachers or school staff access to Gallery, Notices, & Academic Resources.
            </p>
          </div>
        )}
      </main>

      {/* Create / Edit Staff Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="primary-gradient text-white p-6 flex justify-between items-center">
              <h3 className="text-lg font-bold font-serif flex items-center gap-2">
                <FiShield /> {editingUser ? 'Edit Staff Account' : 'Create Staff Account'}
              </h3>
              <button onClick={handleCloseModal} className="p-1 text-white/80 hover:text-white rounded-full">
                <FiX className="text-xl" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Kumar (Teacher)"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Username *
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="e.g. rahulkumar"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="staff@ssglobalpublicschool.edu.in"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Password * (Min 8 characters)
                  </label>
                  <input
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Set temporary password..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Account Role
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="staff">Staff Admin (Restricted Access: Gallery, Notices, Messages, Academic Resources)</option>
                  <option value="superadmin">Super Admin (Full Access to Everything)</option>
                </select>
              </div>

              {editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Account Access Status
                  </label>
                  <select
                    value={formData.isActive ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.value === 'true' })}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="true">Active (Allowed to log in)</option>
                    <option value="false">Disabled (Login Blocked)</option>
                  </select>
                </div>
              )}

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
                  {submitting ? 'Saving...' : editingUser ? 'Save Changes' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {resetPasswordUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-2xl mx-auto font-bold">
              <FiKey />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold font-serif text-slate-900">Reset Staff Password</h3>
              <p className="text-xs text-slate-500">
                Set a new password for <strong className="text-slate-800">{resetPasswordUser.name}</strong> ({resetPasswordUser.email}).
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  New Password (Min 8 chars) *
                </label>
                <input
                  type="password"
                  required
                  value={resetPasswordData.newPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, newPassword: e.target.value })}
                  placeholder="Enter new password..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Confirm New Password *
                </label>
                <input
                  type="password"
                  required
                  value={resetPasswordData.confirmPassword}
                  onChange={(e) => setResetPasswordData({ ...resetPasswordData, confirmPassword: e.target.value })}
                  placeholder="Re-enter new password..."
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setResetPasswordUser(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md transition-all disabled:opacity-50"
                >
                  {submitting ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center text-2xl mx-auto">
              <FiTrash2 />
            </div>
            <h3 className="text-lg font-bold font-serif text-slate-900">Delete Staff Account?</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete the admin account for <strong className="text-slate-900">"{deleteConfirmUser.name}"</strong> ({deleteConfirmUser.email})?
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmUser(null)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md transition-all"
              >
                Yes, Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
