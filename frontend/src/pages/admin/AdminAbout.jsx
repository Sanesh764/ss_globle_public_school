import React, { useState, useEffect, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import AdminHeader from '../../components/admin/AdminHeader';
import { SettingContext } from '../../context/SettingContext';
import { useToast } from '../../hooks/useToast';
import { updateSettingsApi } from '../../services/settingService';
import {
  FiSave,
  FiFileText,
  FiUploadCloud,
  FiPlus,
  FiTrash2,
  FiEdit,
  FiCheckCircle,
  FiMonitor,
  FiCpu,
  FiBookOpen,
  FiActivity,
  FiShield,
  FiX,
  FiLayers,
} from 'react-icons/fi';

const ICON_OPTIONS = [
  { label: 'Check Circle (FiCheckCircle)', value: 'FiCheckCircle' },
  { label: 'Smart Monitor (FiMonitor)', value: 'FiMonitor' },
  { label: 'Science & Computer (FiCpu)', value: 'FiCpu' },
  { label: 'Library & Academic (FiBookOpen)', value: 'FiBookOpen' },
  { label: 'Sports & Activity (FiActivity)', value: 'FiActivity' },
  { label: 'Security & Safety (FiShield)', value: 'FiShield' },
];

const AdminAbout = () => {
  const outletContext = useOutletContext();
  const setMobileOpen = outletContext?.setMobileOpen || (() => {});
  const { settings, fetchSettings } = useContext(SettingContext);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    aboutHeroTitle: '',
    aboutHeroSubtitle: '',
    aboutBadge: '',
    aboutTitle: '',
    aboutText1: '',
    aboutText2: '',
    aboutExpNumber: '',
    aboutExpText: '',
    aboutButtonText: '',
    aboutButtonLink: '',
    principalName: '',
    principalMessage: '',
    directorName: '',
    directorMessage: '',
  });

  const [featuresList, setFeaturesList] = useState([]);
  const [aboutImageFile, setAboutImageFile] = useState(null);
  const [heroBgFile, setHeroBgFile] = useState(null);
  const [principalPhotoFile, setPrincipalPhotoFile] = useState(null);
  const [directorPhotoFile, setDirectorPhotoFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Feature Item Modal
  const [isFeatureModalOpen, setIsFeatureModalOpen] = useState(false);
  const [editingFeatureIndex, setEditingFeatureIndex] = useState(null);
  const [featureForm, setFeatureForm] = useState({ title: '', icon: 'FiCheckCircle' });

  useEffect(() => {
    if (settings) {
      setFormData({
        aboutHeroTitle: settings.aboutHeroTitle || 'About S.S. Global Public School',
        aboutHeroSubtitle: settings.aboutHeroSubtitle || 'Nurturing curiosity, character, and academic excellence in Daudnagar, Bihar since 2011.',
        aboutBadge: settings.aboutBadge || 'ABOUT OUR INSTITUTE',
        aboutTitle: settings.aboutTitle || 'Dedicated to Excellence in Education & Character Building',
        aboutText1: settings.aboutText1 || settings.aboutText || settings.about || '',
        aboutText2: settings.aboutText2 || '',
        aboutExpNumber: settings.aboutExpNumber || '15+',
        aboutExpText: settings.aboutExpText || 'Years of Educational Excellence',
        aboutButtonText: settings.aboutButtonText || 'Learn More About Us',
        aboutButtonLink: settings.aboutButtonLink || '/about',
        principalName: settings.principalName || 'Ashutosh Kumar',
        principalMessage: settings.principalMessage || '',
        directorName: settings.directorName || 'Er. Manish Singh',
        directorMessage: settings.directorMessage || '',
      });

      if (Array.isArray(settings.aboutFeaturesList) && settings.aboutFeaturesList.length > 0) {
        setFeaturesList(settings.aboutFeaturesList);
      } else if (Array.isArray(settings.aboutFeatures)) {
        setFeaturesList(settings.aboutFeatures.map((f) => ({ title: f, icon: 'FiCheckCircle' })));
      } else {
        setFeaturesList([
          { title: 'Affiliated & aligned with CBSE Academic Standards', icon: 'FiCheckCircle' },
          { title: 'Interactive Smart Classrooms & Digital Learning', icon: 'FiMonitor' },
          { title: 'Comprehensive Science & Robotics Laboratories', icon: 'FiCpu' },
          { title: 'Safe CCTV-Monitored Transport System in Daudnagar', icon: 'FiShield' },
          { title: 'Dedicated Focus on Sports & Holistic Personality Development', icon: 'FiActivity' },
          { title: 'Individual Attention under Principal Leadership', icon: 'FiBookOpen' },
        ]);
      }
    }
  }, [settings]);

  const handleOpenFeatureModal = (index = null) => {
    if (index !== null) {
      setEditingFeatureIndex(index);
      setFeatureForm({
        title: featuresList[index]?.title || '',
        icon: featuresList[index]?.icon || 'FiCheckCircle',
      });
    } else {
      setEditingFeatureIndex(null);
      setFeatureForm({ title: '', icon: 'FiCheckCircle' });
    }
    setIsFeatureModalOpen(true);
  };

  const handleSaveFeature = (e) => {
    e.preventDefault();
    if (!featureForm.title.trim()) {
      addToast('Feature title is required', 'error');
      return;
    }

    if (editingFeatureIndex !== null) {
      const updated = [...featuresList];
      updated[editingFeatureIndex] = { ...featureForm };
      setFeaturesList(updated);
      addToast('Feature item updated!', 'success');
    } else {
      setFeaturesList([...featuresList, { ...featureForm }]);
      addToast('New feature item added!', 'success');
    }

    setIsFeatureModalOpen(false);
  };

  const handleDeleteFeature = (index) => {
    const updated = featuresList.filter((_, i) => i !== index);
    setFeaturesList(updated);
    addToast('Feature item removed!', 'info');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const dataToSubmit = new FormData();

      Object.keys(formData).forEach((key) => {
        dataToSubmit.append(key, formData[key]);
      });

      dataToSubmit.append('aboutFeaturesList', JSON.stringify(featuresList));
      dataToSubmit.append('aboutFeatures', JSON.stringify(featuresList.map((f) => f.title)));

      if (aboutImageFile) {
        dataToSubmit.append('aboutImage', aboutImageFile);
      }

      if (heroBgFile) {
        dataToSubmit.append('aboutHeroBgImage', heroBgFile);
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
        addToast('About Page content updated successfully!', 'success');
        fetchSettings(updatedSettings);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update About Page content.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <AdminHeader setMobileOpen={setMobileOpen} title="About Page CMS Manager" />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6">
        <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl">
          {/* Section 1: Hero Header */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-blue-600 pl-3 flex items-center gap-2">
              <FiLayers className="text-blue-600" /> 1. About Page Hero Header
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Hero Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.aboutHeroTitle}
                  onChange={(e) => setFormData({ ...formData, aboutHeroTitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Hero Subtitle
                </label>
                <input
                  type="text"
                  value={formData.aboutHeroSubtitle}
                  onChange={(e) => setFormData({ ...formData, aboutHeroSubtitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Upload Hero Background Image (Optional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setHeroBgFile(e.target.files[0])}
                className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {settings?.aboutHeroBgImage && (
                <div className="mt-2 flex items-center gap-3">
                  <img src={settings.aboutHeroBgImage} alt="Hero Background" className="w-20 h-12 rounded-xl object-cover border border-slate-200" />
                  <span className="text-xs text-slate-500">Current Hero Background Image Attached</span>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Main About Content */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-amber-500 pl-3 flex items-center gap-2">
              <FiFileText className="text-amber-500" /> 2. About Section Content & Paragraphs
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Badge Text
                </label>
                <input
                  type="text"
                  value={formData.aboutBadge}
                  onChange={(e) => setFormData({ ...formData, aboutBadge: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Main Heading *
                </label>
                <input
                  type="text"
                  required
                  value={formData.aboutTitle}
                  onChange={(e) => setFormData({ ...formData, aboutTitle: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description Paragraph 1
              </label>
              <textarea
                rows="3"
                value={formData.aboutText1}
                onChange={(e) => setFormData({ ...formData, aboutText1: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Description Paragraph 2
              </label>
              <textarea
                rows="3"
                value={formData.aboutText2}
                onChange={(e) => setFormData({ ...formData, aboutText2: e.target.value })}
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                Upload School Building / Campus Photo
              </label>
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl text-center space-y-2">
                <FiUploadCloud className="text-3xl text-blue-600 mx-auto" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAboutImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                {aboutImageFile ? (
                  <p className="text-xs font-bold text-emerald-600 flex items-center justify-center gap-1">
                    <FiCheckCircle /> Selected: {aboutImageFile.name}
                  </p>
                ) : settings?.aboutImage ? (
                  <div className="flex items-center justify-center gap-3 pt-2">
                    <img src={settings.aboutImage} alt="Campus Building" className="w-16 h-12 rounded-xl object-cover border border-slate-200" />
                    <span className="text-xs text-slate-500">Current Building Image Attached</span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          {/* Section 3: Features List CRUD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-indigo-600 pl-3">
                3. Key Highlights & Features List
              </h3>
              <button
                type="button"
                onClick={() => handleOpenFeatureModal()}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center gap-1.5"
              >
                <FiPlus /> Add Feature Item
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {featuresList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base font-bold shrink-0">
                      <FiCheckCircle />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Icon: {item.icon}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleOpenFeatureModal(idx)}
                      className="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg"
                      title="Edit Item"
                    >
                      <FiEdit />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFeature(idx)}
                      className="p-1.5 text-rose-600 hover:bg-rose-100 rounded-lg"
                      title="Delete Item"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Leadership Messages & Photos */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-lg font-bold font-serif text-slate-900 border-l-4 border-purple-600 pl-3">
              4. Leadership Messages & Photos
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

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-base shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave className="text-xl" /> {submitting ? 'Saving Changes...' : 'Save All About Content'}
            </button>
          </div>
        </form>
      </main>

      {/* Feature Add/Edit Modal */}
      {isFeatureModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold font-serif text-slate-900">
                {editingFeatureIndex !== null ? 'Edit Feature Item' : 'Add New Feature Item'}
              </h3>
              <button onClick={() => setIsFeatureModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700">
                <FiX className="text-lg" />
              </button>
            </div>

            <form onSubmit={handleSaveFeature} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Feature Description / Title *
                </label>
                <input
                  type="text"
                  required
                  value={featureForm.title}
                  onChange={(e) => setFeatureForm({ ...featureForm, title: e.target.value })}
                  placeholder="e.g. Interactive Smart Classrooms & Digital Labs"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                  Icon Style
                </label>
                <select
                  value={featureForm.icon}
                  onChange={(e) => setFeatureForm({ ...featureForm, icon: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  {ICON_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFeatureModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAbout;
