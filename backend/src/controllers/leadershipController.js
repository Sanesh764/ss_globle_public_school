import Leadership from '../models/Leadership.js';
import { processUploadedFile, deleteUploadedFile } from '../middleware/uploadMiddleware.js';

/**
 * GET /api/leadership
 * Public endpoint returning active leadership members sorted by displayOrder ASC.
 */
export const getPublicLeadership = async (req, res, next) => {
  try {
    const members = await Leadership.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
      leadership: members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/leadership
 * Protected Admin endpoint returning all leadership members.
 */
export const getAdminLeadership = async (req, res, next) => {
  try {
    const members = await Leadership.find().sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
      leadership: members,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/leadership
 * Protected Admin endpoint to create a new leadership profile.
 */
export const createLeadership = async (req, res, next) => {
  try {
    const { name, designation, heading, message, location, displayOrder, isActive, showOnHomepage } = req.body;

    let imageUrl = req.body.image || '';
    let publicId = '';

    if (req.file) {
      const uploadResult = await processUploadedFile(req.file, 'ss_global_leadership');
      imageUrl = uploadResult.url;
      publicId = uploadResult.public_id;
    }

    if (!name || !designation || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, designation, and message.',
      });
    }

    const newMember = await Leadership.create({
      name: name.trim(),
      designation: designation.trim(),
      heading: heading ? heading.trim() : 'Building Strong Foundations',
      message: message.trim(),
      location: location ? location.trim() : 'Daudnagar, Bihar',
      image: imageUrl,
      public_id: publicId,
      displayOrder: displayOrder ? parseInt(displayOrder, 10) : 1,
      isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
      showOnHomepage: showOnHomepage === undefined ? true : (showOnHomepage === 'true' || showOnHomepage === true),
    });

    return res.status(201).json({
      success: true,
      message: 'Leadership member created successfully',
      data: newMember,
      leadership: newMember,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/leadership/:id
 * Protected Admin endpoint to update a leadership profile.
 */
export const updateLeadership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await Leadership.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Leadership member not found.',
      });
    }

    const { name, designation, heading, message, location, displayOrder, isActive, showOnHomepage } = req.body;

    if (name) member.name = name.trim();
    if (designation) member.designation = designation.trim();
    if (heading !== undefined) member.heading = heading.trim();
    if (message) member.message = message.trim();
    if (location !== undefined) member.location = location.trim();
    if (displayOrder !== undefined) member.displayOrder = parseInt(displayOrder, 10);
    if (isActive !== undefined) member.isActive = isActive === 'true' || isActive === true;
    if (showOnHomepage !== undefined) member.showOnHomepage = showOnHomepage === 'true' || showOnHomepage === true;

    if (req.file) {
      if (member.public_id || member.image) {
        await deleteUploadedFile(member.public_id || member.image);
      }
      const uploadResult = await processUploadedFile(req.file, 'ss_global_leadership');
      member.image = uploadResult.url;
      member.public_id = uploadResult.public_id;
    } else if (req.body.image) {
      member.image = req.body.image;
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: 'Leadership member updated successfully',
      data: member,
      leadership: member,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/leadership/:id
 * Protected Admin endpoint to delete a leadership profile.
 */
export const deleteLeadership = async (req, res, next) => {
  try {
    const { id } = req.params;
    const member = await Leadership.findById(id);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: 'Leadership member not found.',
      });
    }

    if (member.public_id || member.image) {
      await deleteUploadedFile(member.public_id || member.image);
    }

    await member.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Leadership member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
