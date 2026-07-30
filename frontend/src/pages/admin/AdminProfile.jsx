import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { useToast } from '../../hooks/useToast';
import { useAuth } from '../../hooks/useAuth';
import {
  getSuperAdminProfileApi,
  updateSuperAdminProfileApi,
  updateSuperAdminPasswordApi,
} from '../../services/authService';
import { formatDate } from '../../utils/formatDate';
import {
  FiUser,
  FiLock,
  FiShield,
  FiSave,
  FiKey,
  FiRefreshCw,
  FiCheckCircle,
  FiCalendar,
} from 'react-icons/fi';

const AdminProfile = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const { addToast } = useToast();
  const { logout } = useAuth();

  const [loading, setLoading] = useState(true);
  const [submittingProfile, setSubmittingProfile] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState({
    name: '',
    username: '',
    email: '',
    role: 'superadmin',
    createdAt: '',
  });

  // Password Form State
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await getSuperAdminProfileApi();
      const p = res?.data?.profile || res?.profile || {};
      setProfileData({
        name: p.name || '',
        username: p.username || (p.email ? p.email.split('@')[0] : ''),
        email: p.email || '',
        role: p.role || 'superadmin',
        createdAt: p.createdAt || '',
      });
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to fetch admin profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();

    if (!profileData.name.trim()) {
      addToast('Full name is required.', 'error');
      return;
    }
    if (!profileData.username.trim()) {
      addToast('Username is required.', 'error');
      return;
    }
    if (!profileData.email.trim()) {
      addToast('Email address is required.', 'error');
      return;
    }

    try {
      setSubmittingProfile(true);
      await updateSuperAdminProfileApi({
        name: profileData.name,
        username: profileData.username,
        email: profileData.email,
      });
      addToast('Super Admin profile updated successfully!', 'success');
      fetchProfile();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile', 'error');
    } finally {
      setSubmittingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!passwordData.currentPassword) {
      addToast('Current password is required.', 'error');
      return;
    }
    if (!passwordData.newPassword || passwordData.newPassword.length < 8) {
      addToast('New password must be at least 8 characters long.', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New password and Confirm password do not match.', 'error');
      return;
    }

    try {
      setSubmittingPassword(true);
      await updateSuperAdminPasswordApi(passwordData);
      addToast('Password changed successfully! Please log in again with your new password.', 'success');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => {
        logout();
      }, 1500);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to change password', 'error');
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="My Profile & Security Settings" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-5xl">
        {/* Page Banner */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold font-serif text-slate-900 flex items-center gap-2">
              <FiUser className="text-blue-600" /> Super Admin Profile Settings
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Manage your personal administrator account details and password security.
            </p>
          </div>

          <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 inline-flex items-center gap-1.5 shrink-0">
            <FiShield /> Super Admin Account
          </span>
        </div>

        {loading ? (
          <div className="bg-white p-12 rounded-3xl shadow-sm border border-slate-200 text-center">
            <FiRefreshCw className="animate-spin text-3xl text-blue-600 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Loading administrator profile...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Profile Information Form */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <h3 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2">
                  <FiUser className="text-blue-600" /> Account Details
                </h3>
                <span className="text-xs text-slate-400 font-mono">Editable</span>
              </div>

              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    placeholder="Super Admin Name"
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
                    value={profileData.username}
                    onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                    placeholder="admin"
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
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="admin@ssglobalpublicschool.edu.in"
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Account Role (Read-only)
                    </label>
                    <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <FiShield /> Super Admin
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">
                      Created Date (Read-only)
                    </label>
                    <div className="px-4 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <FiCalendar /> {formatDate(profileData.createdAt)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingProfile}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiSave /> {submittingProfile ? 'Saving Profile...' : 'Save Profile Changes'}
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Form */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 space-y-6">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <h3 className="font-serif font-bold text-slate-900 text-lg flex items-center gap-2">
                  <FiKey className="text-amber-600" /> Change Security Password
                </h3>
                <span className="text-xs text-amber-600 font-semibold">Min 8 Characters</span>
              </div>

              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    Current Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    placeholder="Enter current password..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    placeholder="Minimum 8 characters..."
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
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    placeholder="Re-enter new password..."
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium"
                  />
                </div>

                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 leading-relaxed flex items-start gap-2">
                  <FiLock className="text-base text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Changing your password will require you to log back in with your new credentials immediately.
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="submit"
                    disabled={submittingPassword}
                    className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    <FiLock /> {submittingPassword ? 'Updating Password...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminProfile;
