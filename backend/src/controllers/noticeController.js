import Notice from '../models/Notice.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get all notices (with pagination & search & filter)
// @route   GET /api/notices
// @access  Public
export const getNotices = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10));
  const search = req.query.search ? req.query.search.trim() : '';
  const category = req.query.category ? req.query.category.trim() : '';

  const query = {};

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  if (category && category !== 'All') {
    query.category = category;
  }

  const count = await Notice.countDocuments(query);
  const notices = await Notice.find(query)
    .populate('createdBy', 'name email')
    .sort({ isImportant: -1, createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        notices,
        page,
        pages: Math.ceil(count / limit) || 1,
        totalNotices: count,
      },
      'Notices retrieved successfully'
    )
  );
});

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Public
export const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id).populate('createdBy', 'name email');
  if (!notice) {
    throw new ApiError(404, 'Notice circular not found');
  }

  res.status(200).json(new ApiResponse(200, { notice }, 'Notice details retrieved'));
});

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private/Admin
export const createNotice = asyncHandler(async (req, res) => {
  const { title, description, category, isImportant, attachmentUrl } = req.body;

  if (!title || !description) {
    throw new ApiError(400, 'Title and description are required fields');
  }

  const notice = new Notice({
    title,
    description,
    category: category || 'General',
    isImportant: Boolean(isImportant),
    attachmentUrl: attachmentUrl || '',
    createdBy: req.admin ? req.admin._id : null,
  });

  const createdNotice = await notice.save();

  res.status(201).json(
    new ApiResponse(201, { notice: createdNotice }, 'Notice published successfully')
  );
});

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Admin
export const updateNotice = asyncHandler(async (req, res) => {
  const { title, description, category, isImportant, attachmentUrl } = req.body;
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    throw new ApiError(404, 'Notice not found to update');
  }

  notice.title = title || notice.title;
  notice.description = description || notice.description;
  notice.category = category || notice.category;
  notice.isImportant = isImportant !== undefined ? isImportant : notice.isImportant;
  notice.attachmentUrl = attachmentUrl !== undefined ? attachmentUrl : notice.attachmentUrl;

  const updatedNotice = await notice.save();

  res.status(200).json(
    new ApiResponse(200, { notice: updatedNotice }, 'Notice updated successfully')
  );
});

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
export const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id);

  if (!notice) {
    throw new ApiError(404, 'Notice not found to delete');
  }

  await Notice.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, {}, 'Notice deleted successfully'));
});
