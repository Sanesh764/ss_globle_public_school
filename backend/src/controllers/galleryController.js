import Gallery from '../models/Gallery.js';
import { processUploadedFile, deleteUploadedFile } from '../middleware/uploadMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get gallery images
// @route   GET /api/gallery
// @access  Public
export const getGalleryImages = asyncHandler(async (req, res) => {
  const category = req.query.category;
  const query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  const images = await Gallery.find(query).sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, { images, totalImages: images.length }, 'Gallery images retrieved')
  );
});

// @desc    Upload new gallery image
// @route   POST /api/gallery
// @access  Private/Admin
export const uploadGalleryImage = asyncHandler(async (req, res) => {
  const { title, category, imageUrl } = req.body;
  let finalImageUrl = imageUrl || '';
  let publicId = '';

  if (req.file) {
    const uploadResult = await processUploadedFile(req.file, 'ss_global_gallery');
    finalImageUrl = uploadResult.url;
    publicId = uploadResult.public_id;
  }

  if (!finalImageUrl) {
    throw new ApiError(400, 'Image file or image URL is required');
  }

  const galleryItem = new Gallery({
    title: title || 'School Event',
    category: category || 'Campus',
    image: finalImageUrl,
    public_id: publicId,
  });

  const savedImage = await galleryItem.save();

  res.status(201).json(
    new ApiResponse(201, { image: savedImage }, 'Image added to gallery successfully')
  );
});

// @desc    Delete gallery image
// @route   DELETE /api/gallery/:id
// @access  Private/Admin
export const deleteGalleryImage = asyncHandler(async (req, res) => {
  const image = await Gallery.findById(req.params.id);

  if (!image) {
    throw new ApiError(404, 'Gallery image not found to delete');
  }

  if (image.public_id || image.image) {
    await deleteUploadedFile(image.public_id || image.image);
  }

  await Gallery.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, {}, 'Gallery image deleted successfully'));
});
