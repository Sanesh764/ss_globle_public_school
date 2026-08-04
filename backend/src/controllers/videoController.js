import Video from '../models/Video.js';
import { extractYouTubeId, generateYouTubeThumbnail, isValidYouTubeUrl } from '../utils/youtube.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Get active videos for public website
// @route   GET /api/videos/public
// @access  Public
export const getPublicVideos = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };

  if (category && category !== 'All') {
    query.category = category;
  }

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 12;
  const skip = (pageNum - 1) * limitNum;

  const totalVideos = await Video.countDocuments(query);
  const videos = await Video.find(query)
    .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  // Available categories for public filtering
  const categories = [
    'All',
    'Academic',
    'Annual Function',
    'Sports',
    'Cultural Program',
    'Independence Day',
    'Republic Day',
    'Classroom Activities',
    'Achievements',
    'Events',
    'Other',
  ];

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          totalVideos,
          currentPage: pageNum,
          totalPages: Math.ceil(totalVideos / limitNum) || 1,
          hasMore: skip + videos.length < totalVideos,
        },
        categories,
      },
      'Public videos retrieved successfully'
    )
  );
});

// @desc    Get single public video details
// @route   GET /api/videos/public/:id
// @access  Public
export const getPublicVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findOne({ _id: req.params.id, isActive: true });

  if (!video) {
    throw new ApiError(404, 'Video not found or is currently inactive');
  }

  res.status(200).json(new ApiResponse(200, { video }, 'Video details retrieved successfully'));
});

// @desc    Get admin video list with filters, search, and pagination
// @route   GET /api/admin/videos
// @access  Private/Admin
export const getAdminVideos = asyncHandler(async (req, res) => {
  const { category, status, isFeatured, search, page = 1, limit = 10 } = req.query;

  const query = {};

  if (category && category !== 'All') {
    query.category = category;
  }

  if (status && status !== 'All') {
    if (status === 'active') query.isActive = true;
    if (status === 'inactive') query.isActive = false;
  }

  if (isFeatured !== undefined && isFeatured !== 'All') {
    query.isFeatured = isFeatured === 'true';
  }

  if (search && search.trim() !== '') {
    const searchRegex = new RegExp(search.trim(), 'i');
    query.$or = [
      { title: searchRegex },
      { description: searchRegex },
      { category: searchRegex },
    ];
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 10;
  const skip = (pageNum - 1) * limitNum;

  const totalVideos = await Video.countDocuments(query);
  const videos = await Video.find(query)
    .sort({ isFeatured: -1, displayOrder: 1, createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        videos,
        pagination: {
          totalVideos,
          currentPage: pageNum,
          totalPages: Math.ceil(totalVideos / limitNum) || 1,
        },
      },
      'Admin videos retrieved successfully'
    )
  );
});

// @desc    Get Video Dashboard Statistics
// @route   GET /api/admin/videos/stats
// @access  Private/Admin
export const getVideoStats = asyncHandler(async (req, res) => {
  const totalVideos = await Video.countDocuments();
  const activeVideos = await Video.countDocuments({ isActive: true });
  const inactiveVideos = await Video.countDocuments({ isActive: false });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const addedThisMonth = await Video.countDocuments({
    createdAt: { $gte: startOfMonth },
  });

  const featuredVideo = await Video.findOne({ isFeatured: true, isActive: true });

  res.status(200).json(
    new ApiResponse(
      200,
      {
        totalVideos,
        activeVideos,
        inactiveVideos,
        addedThisMonth,
        featuredVideo: featuredVideo ? { id: featuredVideo._id, title: featuredVideo.title } : null,
      },
      'Video statistics retrieved successfully'
    )
  );
});

// @desc    Get single video by ID (Admin)
// @route   GET /api/admin/videos/:id
// @access  Private/Admin
export const getVideoById = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  res.status(200).json(new ApiResponse(200, { video }, 'Video details retrieved successfully'));
});

// @desc    Create new Video item
// @route   POST /api/admin/videos
// @access  Private/Admin
export const createVideo = asyncHandler(async (req, res) => {
  const { title, description, youtubeUrl, category, displayOrder, isActive, isFeatured } = req.body;

  if (!title || title.trim() === '') {
    throw new ApiError(400, 'Video title is required');
  }

  if (!youtubeUrl || !isValidYouTubeUrl(youtubeUrl)) {
    throw new ApiError(400, 'Please provide a valid YouTube video URL');
  }

  const youtubeVideoId = extractYouTubeId(youtubeUrl);
  if (!youtubeVideoId) {
    throw new ApiError(400, 'Could not extract a valid YouTube video ID from URL');
  }

  // Prevent duplicate YouTube video IDs
  const existingVideo = await Video.findOne({ youtubeVideoId });
  if (existingVideo) {
    throw new ApiError(409, `A video with YouTube ID '${youtubeVideoId}' already exists: "${existingVideo.title}"`);
  }

  const thumbnail = generateYouTubeThumbnail(youtubeVideoId);

  // Handle Featured video exclusivity
  const shouldBeFeatured = Boolean(isFeatured);
  if (shouldBeFeatured) {
    await Video.updateMany({ isFeatured: true }, { $set: { isFeatured: false } });
  }

  const adminName = req.admin ? (req.admin.name || req.admin.email) : 'Admin';

  const video = new Video({
    title: title.trim(),
    description: description ? description.trim() : '',
    youtubeUrl: youtubeUrl.trim(),
    youtubeVideoId,
    thumbnail,
    category: category || 'Events',
    displayOrder: displayOrder !== undefined ? Number(displayOrder) : 0,
    isActive: isActive !== undefined ? Boolean(isActive) : true,
    isFeatured: shouldBeFeatured,
    provider: 'youtube',
    createdBy: adminName,
    updatedBy: adminName,
  });

  const savedVideo = await video.save();

  res.status(201).json(new ApiResponse(201, { video: savedVideo }, 'Video added to gallery successfully'));
});

// @desc    Update existing Video item
// @route   PUT /api/admin/videos/:id
// @access  Private/Admin
export const updateVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, 'Video not found to update');
  }

  const { title, description, youtubeUrl, category, displayOrder, isActive, isFeatured } = req.body;

  if (title !== undefined) {
    if (title.trim() === '') throw new ApiError(400, 'Video title cannot be empty');
    video.title = title.trim();
  }

  if (description !== undefined) {
    video.description = description.trim();
  }

  if (category !== undefined) {
    video.category = category;
  }

  if (displayOrder !== undefined) {
    video.displayOrder = Number(displayOrder);
  }

  if (isActive !== undefined) {
    video.isActive = Boolean(isActive);
  }

  if (youtubeUrl && youtubeUrl.trim() !== video.youtubeUrl) {
    if (!isValidYouTubeUrl(youtubeUrl)) {
      throw new ApiError(400, 'Please provide a valid YouTube video URL');
    }

    const newVideoId = extractYouTubeId(youtubeUrl);
    if (!newVideoId) {
      throw new ApiError(400, 'Could not extract a valid YouTube video ID from URL');
    }

    const duplicateCheck = await Video.findOne({
      youtubeVideoId: newVideoId,
      _id: { $ne: video._id },
    });

    if (duplicateCheck) {
      throw new ApiError(409, `A video with YouTube ID '${newVideoId}' already exists: "${duplicateCheck.title}"`);
    }

    video.youtubeUrl = youtubeUrl.trim();
    video.youtubeVideoId = newVideoId;
    video.thumbnail = generateYouTubeThumbnail(newVideoId);
  }

  if (isFeatured !== undefined) {
    const newFeatured = Boolean(isFeatured);
    if (newFeatured && !video.isFeatured) {
      // Unset previous featured video
      await Video.updateMany({ _id: { $ne: video._id }, isFeatured: true }, { $set: { isFeatured: false } });
    }
    video.isFeatured = newFeatured;
  }

  video.updatedBy = req.admin ? (req.admin.name || req.admin.email) : 'Admin';

  const updatedVideo = await video.save();

  res.status(200).json(new ApiResponse(200, { video: updatedVideo }, 'Video updated successfully'));
});

// @desc    Delete video item
// @route   DELETE /api/admin/videos/:id
// @access  Private/Admin
export const deleteVideo = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, 'Video not found to delete');
  }

  await Video.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, {}, 'Video deleted successfully'));
});

// @desc    Toggle Video Active Status
// @route   PATCH /api/admin/videos/:id/toggle-status
// @access  Private/Admin
export const toggleVideoStatus = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  video.isActive = !video.isActive;
  video.updatedBy = req.admin ? (req.admin.name || req.admin.email) : 'Admin';
  await video.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { video },
      `Video status changed to ${video.isActive ? 'Active' : 'Inactive'}`
    )
  );
});

// @desc    Toggle Video Featured Status
// @route   PATCH /api/admin/videos/:id/toggle-featured
// @access  Private/Admin
export const toggleVideoFeatured = asyncHandler(async (req, res) => {
  const video = await Video.findById(req.params.id);

  if (!video) {
    throw new ApiError(404, 'Video not found');
  }

  const willBeFeatured = !video.isFeatured;

  if (willBeFeatured) {
    await Video.updateMany({ _id: { $ne: video._id }, isFeatured: true }, { $set: { isFeatured: false } });
  }

  video.isFeatured = willBeFeatured;
  video.updatedBy = req.admin ? (req.admin.name || req.admin.email) : 'Admin';
  await video.save();

  res.status(200).json(
    new ApiResponse(
      200,
      { video },
      `Video is now ${video.isFeatured ? 'Featured' : 'Standard'}`
    )
  );
});

// @desc    Bulk Delete Videos
// @route   POST /api/admin/videos/bulk-delete
// @access  Private/Admin
export const bulkDeleteVideos = asyncHandler(async (req, res) => {
  const { ids } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Please provide an array of video IDs to delete');
  }

  const result = await Video.deleteMany({ _id: { $in: ids } });

  res.status(200).json(
    new ApiResponse(
      200,
      { deletedCount: result.deletedCount },
      `Successfully deleted ${result.deletedCount} video(s)`
    )
  );
});

// @desc    Bulk Update Video Active Status
// @route   PATCH /api/admin/videos/bulk-status
// @access  Private/Admin
export const bulkUpdateStatus = asyncHandler(async (req, res) => {
  const { ids, isActive } = req.body;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    throw new ApiError(400, 'Please provide an array of video IDs');
  }

  if (isActive === undefined) {
    throw new ApiError(400, 'isActive boolean status is required');
  }

  const result = await Video.updateMany(
    { _id: { $in: ids } },
    { $set: { isActive: Boolean(isActive), updatedBy: req.admin ? (req.admin.name || req.admin.email) : 'Admin' } }
  );

  res.status(200).json(
    new ApiResponse(
      200,
      { modifiedCount: result.modifiedCount },
      `Successfully updated status for ${result.modifiedCount} video(s)`
    )
  );
});

// @desc    Reorder Videos Display Order
// @route   PUT /api/admin/videos/reorder
// @access  Private/Admin
export const reorderVideos = asyncHandler(async (req, res) => {
  const { orders } = req.body;

  if (!orders || !Array.isArray(orders) || orders.length === 0) {
    throw new ApiError(400, 'Please provide an array of video orders containing { id, displayOrder }');
  }

  const bulkOps = orders.map((item) => ({
    updateOne: {
      filter: { _id: item.id },
      update: { $set: { displayOrder: Number(item.displayOrder) } },
    },
  }));

  await Video.bulkWrite(bulkOps);

  res.status(200).json(new ApiResponse(200, {}, 'Video display order updated successfully'));
});
