import Facility from '../models/Facility.js';
import { processUploadedFile, deleteUploadedFile } from '../middleware/uploadMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get active facilities for public website
// @route   GET /api/facilities
// @access  Public
export const getPublicFacilities = asyncHandler(async (req, res) => {
  const facilities = await Facility.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { count: facilities.length, facilities }, 'Public facilities fetched successfully'));
});

// @desc    Get all facilities for admin
// @route   GET /api/admin/facilities
// @access  Private/SuperAdmin
export const getAdminFacilities = asyncHandler(async (req, res) => {
  const facilities = await Facility.find().sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { count: facilities.length, facilities }, 'Admin facilities fetched successfully'));
});

// @desc    Create new facility
// @route   POST /api/admin/facilities
// @access  Private/SuperAdmin
export const createFacility = asyncHandler(async (req, res) => {
  const { title, shortDescription, detailedDescription, icon, displayOrder, isActive } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Facility title is required');
  }

  if (!shortDescription || !shortDescription.trim()) {
    res.status(400);
    throw new Error('Short description is required');
  }

  let imageUrl = '';
  let publicId = '';

  if (req.file) {
    const uploadResult = await processUploadedFile(req.file, 'ss_global_facilities');
    imageUrl = uploadResult.url;
    publicId = uploadResult.public_id;
  }

  const facility = await Facility.create({
    title: title.trim(),
    shortDescription: shortDescription.trim(),
    detailedDescription: detailedDescription ? detailedDescription.trim() : '',
    icon: icon ? icon.trim() : 'FiCheckCircle',
    image: imageUrl,
    public_id: publicId,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
  });

  res.status(201).json(new ApiResponse(201, { facility }, 'Facility created successfully'));
});

// @desc    Update facility
// @route   PUT /api/admin/facilities/:id
// @access  Private/SuperAdmin
export const updateFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id);

  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }

  const { title, shortDescription, detailedDescription, icon, displayOrder, isActive } = req.body;

  if (title && title.trim()) facility.title = title.trim();
  if (shortDescription && shortDescription.trim()) facility.shortDescription = shortDescription.trim();
  if (detailedDescription !== undefined) facility.detailedDescription = detailedDescription.trim();
  if (icon !== undefined) facility.icon = icon.trim();
  if (displayOrder !== undefined) facility.displayOrder = Number(displayOrder);
  if (isActive !== undefined) facility.isActive = isActive === 'true' || isActive === true;

  if (req.file) {
    if (facility.public_id || facility.image) {
      await deleteUploadedFile(facility.public_id || facility.image);
    }
    const uploadResult = await processUploadedFile(req.file, 'ss_global_facilities');
    facility.image = uploadResult.url;
    facility.public_id = uploadResult.public_id;
  }

  const updatedFacility = await facility.save();

  res.status(200).json(new ApiResponse(200, { facility: updatedFacility }, 'Facility updated successfully'));
});

// @desc    Delete facility
// @route   DELETE /api/admin/facilities/:id
// @access  Private/SuperAdmin
export const deleteFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id);

  if (!facility) {
    res.status(404);
    throw new Error('Facility not found');
  }

  if (facility.public_id || facility.image) {
    await deleteUploadedFile(facility.public_id || facility.image);
  }

  await facility.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Facility deleted successfully'));
});
