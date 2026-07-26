import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { SettingContext } from '../../context/SettingContext';
import { useToast } from '../../hooks/useToast';
import { updateSettingsApi } from '../../services/settingService';
import { FiSave, FiUploadCloud, FiGlobe, FiPhone, FiMail, FiMapPin, FiUserCheck } from 'react-icons/fi';

const AdminSettings = () => {
  const { setMobileOpen } = useOutletContext();
  const { settings, fetchSettings } = useContext(SettingContext);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    schoolName: '',
    tagline: '',
    address: '',
    phone: '',
    altPhone: '',
    email: '',
    principalName: '',
    principalMessage: '',
    directorName: '',
    directorMessage: '',
    about: '',
    vision: '',
    mission: '',
    officeHours: '',
    googleMapUrl: '',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        schoolName: settings.schoolName || '',
        tagline: settings.tagline || '',
        address: settings.address || '',
        phone: settings.phone || '',
        altPhone: settings.altPhone || '',
        email: settings.email || '',
        principalName: settings.principalName || '',
        principalMessage: settings.principalMessage || '',
        directorName: settings.directorName || '',
        directorMessage: settings.directorMessage || '',
        about: settings.about || '',
        vision: settings.vision || '',
        mission: settings.mission || '',
        officeHours: settings.officeHours || '',
        googleMapUrl: settings.googleMapUrl || '',
        facebook: settings.socialLinks?.facebook || '',
        twitter: settings.socialLinks?.twitter || '',
        instagram: settings.socialLinks?.instagram || '',
        youtube: settings.socialLinks?.youtube || '',
      });
    }
  }, [settings]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();

      Object.keys(formData).forEach((key) => {
        dataToSubmit.append(key, formData[key]);
      });

      if (logoFile) {
        dataToSubmit.append('logo', logoFile);
      }

      const res = await updateSettingsApi(dataToSubmit);
      if (res.success) {
        addToast('School website settings updated successfully!', 'success');
        fetchSettings();
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update website settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="Website Settings Manager" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
          {/* Section 1: General School Information */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-blue-600 pl-3">
              1. General Identity & Branding
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.schoolName}
                  onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  School Tagline / Motto
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Upload School Logo (Optional Image File)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Section 2: Contact Info & Address */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-amber-500 pl-3">
              2. Contact Information & Office Hours
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Campus Address *
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Official Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Primary Phone *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Secondary Phone
                </label>
                <input
                  type="text"
                  value={formData.altPhone}
                  onChange={(e) => setFormData({ ...formData, altPhone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Office Hours
                </label>
                <input
                  type="text"
                  value={formData.officeHours}
                  onChange={(e) => setFormData({ ...formData, officeHours: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Google Map Embed iFrame URL
              </label>
              <input
                type="text"
                value={formData.googleMapUrl}
                onChange={(e) => setFormData({ ...formData, googleMapUrl: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>

          {/* Section 3: Leadership Messages */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-purple-600 pl-3">
              3. Leadership Messages & About School
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Principal Name
                </label>
                <input
                  type="text"
                  value={formData.principalName}
                  onChange={(e) => setFormData({ ...formData, principalName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Director Name
                </label>
                <input
                  type="text"
                  value={formData.directorName}
                  onChange={(e) => setFormData({ ...formData, directorName: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Principal Welcome Address / Message
              </label>
              <textarea
                rows="3"
                value={formData.principalMessage}
                onChange={(e) => setFormData({ ...formData, principalMessage: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Director Address / Message
              </label>
              <textarea
                rows="3"
                value={formData.directorMessage}
                onChange={(e) => setFormData({ ...formData, directorMessage: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                About School Introduction Text
              </label>
              <textarea
                rows="3"
                value={formData.about}
                onChange={(e) => setFormData({ ...formData, about: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>
          </div>

          {/* Section 4: Social Links */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-emerald-500 pl-3">
              4. Social Media Platform Links
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Facebook URL</label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => setFormData({ ...formData, facebook: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Twitter / X URL</label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">YouTube URL</label>
                <input
                  type="text"
                  value={formData.youtube}
                  onChange={(e) => setFormData({ ...formData, youtube: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave className="text-xl" /> {submitting ? 'Saving Settings...' : 'Save All Settings'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default AdminSettings;
