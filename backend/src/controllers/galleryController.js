import Gallery from '../models/Gallery.js';
import { processUploadedFile, deleteUploadedFile } from '../middleware/uploadMiddleware.js';

// @desc    Get gallery images
// @route   GET /api/gallery
// @access  Public
export const getGalleryImages = async (req, res) => {
  try {
    const category = req.query.category;
    const query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    const images = await Gallery.find(query).sort({ createdAt: -1 });
    res.json({ success: true, images, totalImages: images.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Upload new gallery image
// @route   POST /api/gallery
// @access  Private/Admin
export const uploadGalleryImage = async (req, res) => {
  try {
    const { title, category, imageUrl } = req.body;
    let finalImageUrl = imageUrl || '';
    let publicId = '';

    if (req.file) {
      const uploadResult = await processUploadedFile(req.file, 'ss_global_gallery');
      finalImageUrl = uploadResult.url;
      publicId = uploadResult.public_id;
    }

    if (!finalImageUrl) {
      return res.status(400).json({ success: false, message: 'Image file or image URL is required' });
    }

    const galleryItem = new Gallery({
      title: title || 'School Event',
      category: category || 'Campus',
      image: finalImageUrl,
      public_id: publicId,
    });

    const savedImage = await galleryItem.save();
    res.status(201).json({ success: true, image: savedImage, message: 'Image added to gallery successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryImage = async (req, res) => {
  try {
    const image = await Gallery.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ success: false, message: 'Gallery image not found' });
    }

    // Delete image file from Cloudinary or local uploads folder
    if (image.public_id || image.image) {
      await deleteUploadedFile(image.public_id || image.image);
    }

    await Gallery.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Gallery image deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
