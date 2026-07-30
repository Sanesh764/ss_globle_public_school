import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { SettingContext } from '../../context/SettingContext';
import { useToast } from '../../hooks/useToast';
import { updateSettingsApi } from '../../services/settingService';
import { FiSave, FiAlertCircle, FiCheckCircle, FiUploadCloud, FiFileText } from 'react-icons/fi';
import GoogleMap from '../../components/common/GoogleMap';
import { isValidGoogleMapEmbedUrl } from '../../utils/mapUtils';

const AdminSettings = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const { settings, fetchSettings } = useContext(SettingContext);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    schoolName: '',
    tagline: '',
    favicon: '',
    admissionButtonText: '',
    admissionButtonLink: '',
    address: '',
    phone: '',
    altPhone: '',
    email: '',
    officeHours: '',
    googleMapUrl: '',
    aboutBadge: '',
    aboutTitle: '',
    aboutText: '',
    aboutExpNumber: '',
    aboutExpText: '',
    aboutFeatures: '',
    aboutButtonText: '',
    aboutButtonLink: '',
    principalName: '',
    principalMessage: '',
    directorName: '',
    directorMessage: '',
    facebook: '',
    twitter: '',
    instagram: '',
    youtube: '',
  });

  const [logoFile, setLogoFile] = useState(null);
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [principalPhotoFile, setPrincipalPhotoFile] = useState(null);
  const [directorPhotoFile, setDirectorPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mapUrlError, setMapUrlError] = useState('');

  useEffect(() => {
    if (settings) {
      const featuresStr = Array.isArray(settings.aboutFeatures)
        ? settings.aboutFeatures.join(', ')
        : settings.aboutFeatures || '';

      setFormData({
        schoolName: settings.schoolName || '',
        tagline: settings.tagline || '',
        favicon: settings.favicon || '/favicon.ico',
        admissionButtonText: settings.admissionButtonText || 'Admission Open 2026-27',
        admissionButtonLink: settings.admissionButtonLink || '/contact',
        address: settings.address || '',
        phone: settings.phone || '',
        altPhone: settings.altPhone || '',
        email: settings.email || '',
        officeHours: settings.officeHours || '',
        googleMapUrl: settings.googleMapUrl || '',
        aboutBadge: settings.aboutBadge || 'ABOUT OUR INSTITUTE',
        aboutTitle: settings.aboutTitle || 'Dedicated to Excellence in Education & Character Building',
        aboutText: settings.aboutText || settings.about || '',
        aboutExpNumber: settings.aboutExpNumber || '15+',
        aboutExpText: settings.aboutExpText || 'Years of Educational Excellence',
        aboutFeatures: featuresStr,
        aboutButtonText: settings.aboutButtonText || 'Learn More About Us',
        aboutButtonLink: settings.aboutButtonLink || '/about',
        principalName: settings.principalName || '',
        principalMessage: settings.principalMessage || '',
        directorName: settings.directorName || '',
        directorMessage: settings.directorMessage || '',
        facebook: settings.socialLinks?.facebook || '',
        twitter: settings.socialLinks?.twitter || '',
        instagram: settings.socialLinks?.instagram || '',
        youtube: settings.socialLinks?.youtube || '',
      });
      setMapUrlError('');
    }
  }, [settings]);

  const handleMapUrlChange = (e) => {
    let inputVal = e.target.value;

    if (inputVal.includes('<iframe') && inputVal.includes('src=')) {
      const srcMatch = inputVal.match(/src=["']([^"']+)["']/i);
      if (srcMatch && srcMatch[1]) {
        inputVal = srcMatch[1].trim();
      }
    }

    setFormData((prev) => ({ ...prev, googleMapUrl: inputVal }));

    const isMapUrlChanged = inputVal !== (settings?.googleMapUrl || '');
    if (isMapUrlChanged && inputVal.trim() && !isValidGoogleMapEmbedUrl(inputVal)) {
      setMapUrlError('Please enter the official Google Maps Embed URL, not a shared Google Maps link.');
    } else {
      setMapUrlError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isMapUrlChanged = formData.googleMapUrl !== (settings?.googleMapUrl || '');
    if (isMapUrlChanged && formData.googleMapUrl.trim() && !isValidGoogleMapEmbedUrl(formData.googleMapUrl)) {
      setMapUrlError('Please enter the official Google Maps Embed URL, not a shared Google Maps link.');
      addToast('Invalid Google Maps URL. Please enter an official embed URL.', 'error');
      return;
    }

    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();

      Object.keys(formData).forEach((key) => {
        dataToSubmit.append(key, formData[key]);
      });

      if (logoFile) {
        dataToSubmit.append('logo', logoFile);
      }

      if (aboutImageFile) {
        dataToSubmit.append('aboutImage', aboutImageFile);
      }

      if (principalPhotoFile) {
        dataToSubmit.append('principalPhoto', principalPhotoFile);
      }

      if (directorPhotoFile) {
        dataToSubmit.append('directorPhoto', directorPhotoFile);
      }

      const res = await updateSettingsApi(dataToSubmit);
      const updatedSettings = res?.data?.settings || res?.settings;
      if (res.success) {
        addToast('School website settings updated successfully!', 'success');
        fetchSettings(updatedSettings);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update website settings.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="Website Settings & CMS Manager" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
          {/* Section 1: General Branding */}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Admission Button Text
                </label>
                <input
                  type="text"
                  value={formData.admissionButtonText}
                  onChange={(e) => setFormData({ ...formData, admissionButtonText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Admission Button Link
                </label>
                <input
                  type="text"
                  value={formData.admissionButtonLink}
                  onChange={(e) => setFormData({ ...formData, admissionButtonLink: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Upload School Logo
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setLogoFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {settings?.logo && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={settings.logo} alt="Logo Preview" className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                  <span className="text-xs text-slate-500">Current Logo attached</span>
                </div>
              )}
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

            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 uppercase">
                Google Map Embed iFrame URL
              </label>
              <input
                type="text"
                value={formData.googleMapUrl}
                onChange={handleMapUrlChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 ${
                  mapUrlError
                    ? 'border-red-500 focus:ring-red-500 bg-red-50/30'
                    : 'border-slate-300 focus:ring-blue-600'
                }`}
              />
              {mapUrlError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-semibold flex items-center gap-2">
                  <FiAlertCircle className="text-red-600 text-base shrink-0" />
                  {mapUrlError}
                </div>
              )}

              <div className="pt-3">
                <label className="block text-xs font-bold text-slate-600 uppercase mb-2">
                  Map Live Preview
                </label>
                <div className="rounded-2xl overflow-hidden border border-slate-200 h-64">
                  <GoogleMap
                    src={formData.googleMapUrl}
                    schoolName={formData.schoolName || 'S.S. Global Public School'}
                    address={formData.address || 'Daudnagar, Bihar'}
                    phone={formData.phone}
                    height="100%"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: About Institute Content */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-indigo-600 pl-3">
              3. About Institute Section
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Section Badge
                </label>
                <input
                  type="text"
                  value={formData.aboutBadge}
                  onChange={(e) => setFormData({ ...formData, aboutBadge: e.target.value })}
                  placeholder="e.g. ABOUT OUR INSTITUTE"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Heading
                </label>
                <input
                  type="text"
                  value={formData.aboutTitle}
                  onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
                  placeholder="e.g. Dedicated to Excellence in Education"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Main About Description
              </label>
              <textarea
                rows="4"
                value={formData.aboutText}
                onChange={(e) => setFormData({ ...formData, aboutText: e.target.value })}
                placeholder="Full description of the institute..."
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Experience Badge Number
                </label>
                <input
                  type="text"
                  value={formData.aboutExpNumber}
                  onChange={(e) => setFormData({ ...formData, aboutExpNumber: e.target.value })}
                  placeholder="e.g. 15+"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Experience Badge Text
                </label>
                <input
                  type="text"
                  value={formData.aboutExpText}
                  onChange={(e) => setFormData({ ...formData, aboutExpText: e.target.value })}
                  placeholder="e.g. Years of Educational Excellence"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Key Features List (Comma separated)
              </label>
              <input
                type="text"
                value={formData.aboutFeatures}
                onChange={(e) => setFormData({ ...formData, aboutFeatures: e.target.value })}
                placeholder="e.g. CBSE Curriculum, Smart Classrooms, Experienced Faculty, Holistic Sports"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Button Text
                </label>
                <input
                  type="text"
                  value={formData.aboutButtonText}
                  onChange={(e) => setFormData({ ...formData, aboutButtonText: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Button Link
                </label>
                <input
                  type="text"
                  value={formData.aboutButtonLink}
                  onChange={(e) => setFormData({ ...formData, aboutButtonLink: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Upload School Building / Campus Image
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setAboutImageFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {settings?.aboutImage && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={settings.aboutImage} alt="Campus Building" className="w-16 h-12 rounded-xl object-cover border border-slate-200" />
                  <span className="text-xs text-slate-500">Current Building Image Attached</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Leadership Messages */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-purple-600 pl-3">
              4. Leadership Messages
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Principal Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPrincipalPhotoFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {settings?.principalPhoto && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={settings.principalPhoto} alt="Principal Preview" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <span className="text-xs text-slate-500">Current Principal Photo</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Upload Director Photo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setDirectorPhotoFile(e.target.files[0])}
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {settings?.directorPhoto && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={settings.directorPhoto} alt="Director Preview" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                    <span className="text-xs text-slate-500">Current Director Photo</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Principal Welcome Message
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
          </div>

          {/* Section 5: Social Media Links */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-emerald-500 pl-3">
              5. Social Media Platform Links
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
