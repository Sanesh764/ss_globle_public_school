import AcademicResource from '../models/AcademicResource.js';
import { processUploadedFile, deleteUploadedFile } from '../middleware/uploadMiddleware.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get active academic resources for public website
// @route   GET /api/academic-resources
// @access  Public
export const getPublicAcademicResources = asyncHandler(async (req, res) => {
  const resources = await AcademicResource.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { count: resources.length, resources }, 'Academic resources retrieved'));
});

// @desc    Get all academic resources for admin
// @route   GET /api/admin/academic-resources
// @access  Private/Admin (Staff & Super Admin)
export const getAdminAcademicResources = asyncHandler(async (req, res) => {
  const resources = await AcademicResource.find().sort({ displayOrder: 1, createdAt: -1 });
  res.status(200).json(new ApiResponse(200, { count: resources.length, resources }, 'Admin academic resources retrieved'));
});

// @desc    Create new academic resource
// @route   POST /api/admin/academic-resources
// @access  Private/Admin (Staff & Super Admin)
export const createAcademicResource = asyncHandler(async (req, res) => {
  const { title, category, description, displayOrder, isActive } = req.body;

  if (!title || !title.trim()) {
    res.status(400);
    throw new Error('Title is required');
  }

  let fileUrl = '';
  let filePublicId = '';

  if (req.file) {
    const uploadResult = await processUploadedFile(req.file, 'ss_global_academic_resources');
    fileUrl = uploadResult.url;
    filePublicId = uploadResult.public_id;
  }

  const resource = await AcademicResource.create({
    title: title.trim(),
    category: category ? category.trim() : 'General',
    description: description ? description.trim() : '',
    image: fileUrl,
    public_id: filePublicId,
    fileUrl,
    filePublicId,
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isActive: isActive !== undefined ? (isActive === 'true' || isActive === true) : true,
  });

  res.status(201).json(new ApiResponse(201, { resource }, 'Academic resource created successfully'));
});

// @desc    Update academic resource
// @route   PUT /api/admin/academic-resources/:id
// @access  Private/Admin (Staff & Super Admin)
export const updateAcademicResource = asyncHandler(async (req, res) => {
  const resource = await AcademicResource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Academic resource not found');
  }

  const { title, category, description, displayOrder, isActive } = req.body;

  if (title && title.trim()) resource.title = title.trim();
  if (category && category.trim()) resource.category = category.trim();
  if (description !== undefined) resource.description = description.trim();
  if (displayOrder !== undefined) resource.displayOrder = Number(displayOrder);
  if (isActive !== undefined) resource.isActive = isActive === 'true' || isActive === true;

  if (req.file) {
    const oldAsset = resource.public_id || resource.image || resource.filePublicId || resource.fileUrl;
    if (oldAsset) {
      await deleteUploadedFile(oldAsset);
    }
    const uploadResult = await processUploadedFile(req.file, 'ss_global_academic_resources');
    resource.image = uploadResult.url;
    resource.public_id = uploadResult.public_id;
    resource.fileUrl = uploadResult.url;
    resource.filePublicId = uploadResult.public_id;
  }

  const updatedResource = await resource.save();

  res.status(200).json(new ApiResponse(200, { resource: updatedResource }, 'Academic resource updated successfully'));
});

// @desc    Delete academic resource
// @route   DELETE /api/admin/academic-resources/:id
// @access  Private/Admin (Staff & Super Admin)
export const deleteAcademicResource = asyncHandler(async (req, res) => {
  const resource = await AcademicResource.findById(req.params.id);

  if (!resource) {
    res.status(404);
    throw new Error('Academic resource not found');
  }

  const assetToDelete = resource.public_id || resource.image || resource.filePublicId || resource.fileUrl;
  if (assetToDelete) {
    await deleteUploadedFile(assetToDelete);
  }

  await resource.deleteOne();

  res.status(200).json(new ApiResponse(200, null, 'Academic resource deleted successfully'));
});
