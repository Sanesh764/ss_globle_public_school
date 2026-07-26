import React, { useState } from 'react';
import { FiX, FiUploadCloud } from 'react-icons/fi';
import { GALLERY_CATEGORIES } from '../../utils/constants';

const GalleryUploadModal = ({ isOpen, onClose, onSubmit, loading = false }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Campus');
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('title', title);
    formData.append('category', category);

    if (file) {
      formData.append('image', file);
    } else if (imageUrl) {
      formData.append('imageUrl', imageUrl);
    } else {
      alert('Please upload an image file or enter an image URL');
      return;
    }

    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-200">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-serif font-bold text-lg">Upload Gallery Photo</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Image Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Exhibition 2026"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {GALLERY_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Option A: File Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Upload Image File (Multer / Cloudinary)
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div className="text-center text-xs text-slate-400 font-bold uppercase my-1">OR</div>

          {/* Option B: Direct Image URL */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Image Direct URL
            </label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-sm font-bold shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              <FiUploadCloud className="text-lg" /> {loading ? 'Uploading...' : 'Upload Image'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GalleryUploadModal;
