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

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-[#CFC5B1] rounded-sm text-sm text-[#252821] focus:outline-none focus:border-[#34483B] focus:ring-1 focus:ring-[#34483B]';
  const labelClass = 'block text-[11px] font-semibold text-[#34483B] uppercase tracking-wider mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-[#252821]/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#F4EFE3] rounded-sm max-w-lg w-full shadow-xl overflow-hidden border border-[#CFC5B1]">
        <div className="bg-[#34483B] px-6 py-4 text-[#F4EFE3] flex items-center justify-between border-b-2 border-[#AD8746]">
          <h3 className="font-serif font-bold text-lg">Upload Gallery Photo</h3>
          <button onClick={onClose} className="text-[#EBE2CC] hover:text-white p-1" aria-label="Close">
            <FiX className="text-xl" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className={labelClass}>Image Title *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Science Exhibition 2026"
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Category *</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {GALLERY_CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={labelClass}>Upload Image File (Multer / Cloudinary)</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files[0])}
              className="w-full text-sm text-[#55594E] file:mr-4 file:py-2 file:px-4 file:rounded-sm file:border file:border-[#CFC5B1] file:text-xs file:font-semibold file:bg-[#EBE2CC] file:text-[#34483B] hover:file:bg-[#DED5C1]"
            />
          </div>

          <div className="text-center text-xs text-[#55594E] font-semibold uppercase my-1">OR</div>

          <div>
            <label className={labelClass}>Image Direct URL</label>
            <input
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className={inputClass}
            />
          </div>

          <div className="pt-4 border-t border-[#CFC5B1] flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-sm border border-[#CFC5B1] bg-[#EBE2CC] text-[#252821] text-sm font-semibold hover:bg-[#DED5C1]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-sm bg-[#34483B] hover:bg-[#27372D] text-[#F4EFE3] text-sm font-semibold disabled:opacity-50 flex items-center gap-2"
            >
              <FiUploadCloud className="text-lg text-[#AD8746]" />
              <span>{loading ? 'Uploading...' : 'Upload Image'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GalleryUploadModal;
