import Leadership from '../models/Leadership.js';

/**
 * GET /api/leadership
 * Public endpoint returning active homepage leadership members sorted by displayOrder ASC.
 */
export const getPublicLeadership = async (req, res, next) => {
  try {
    const members = await Leadership.find({ isActive: true, showOnHomepage: true })
      .sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: members.length,
      data: members,
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
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    if (!name || !designation || !message || !imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, designation, message, and profile image.',
      });
    }

    const newMember = await Leadership.create({
      name,
      designation,
      heading: heading || 'Building Strong Foundations',
      message,
      location: location || 'Daudnagar, Bihar',
      image: imageUrl,
      displayOrder: displayOrder ? parseInt(displayOrder, 10) : 1,
      isActive: isActive === undefined ? true : Boolean(isActive),
      showOnHomepage: showOnHomepage === undefined ? true : Boolean(showOnHomepage),
    });

    return res.status(201).json({
      success: true,
      message: 'Leadership member created successfully',
      data: newMember,
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

    if (name) member.name = name;
    if (designation) member.designation = designation;
    if (heading !== undefined) member.heading = heading;
    if (message) member.message = message;
    if (location !== undefined) member.location = location;
    if (displayOrder !== undefined) member.displayOrder = parseInt(displayOrder, 10);
    if (isActive !== undefined) member.isActive = Boolean(isActive);
    if (showOnHomepage !== undefined) member.showOnHomepage = Boolean(showOnHomepage);

    if (req.file) {
      member.image = `/uploads/${req.file.filename}`;
    } else if (req.body.image) {
      member.image = req.body.image;
    }

    await member.save();

    return res.status(200).json({
      success: true,
      message: 'Leadership member updated successfully',
      data: member,
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

    await Leadership.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Leadership member deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
