import HeroSlide from '../models/HeroSlide.js';

/**
 * GET /api/hero-slider
 * Public endpoint returning active slides sorted by displayOrder ASC.
 */
export const getPublicHeroSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find({ isActive: true }).sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: slides.length,
      slides,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/admin/hero-slider
 * Protected Admin endpoint returning all slides.
 */
export const getAdminHeroSlides = async (req, res, next) => {
  try {
    const slides = await HeroSlide.find().sort({ displayOrder: 1, createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: slides.length,
      slides,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/admin/hero-slider
 * Protected Admin endpoint to create a new hero slide.
 */
export const createHeroSlide = async (req, res, next) => {
  try {
    let backgroundImage = req.body.backgroundImage || '';
    if (req.file) {
      backgroundImage = `/uploads/${req.file.filename}`;
    }

    if (!backgroundImage) {
      return res.status(400).json({
        success: false,
        message: 'Background image is required.',
      });
    }

    const {
      badge,
      title,
      highlightTitle,
      description,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      displayOrder,
      isActive,
      autoPlay,
    } = req.body;

    const newSlide = await HeroSlide.create({
      backgroundImage,
      badge: badge || 'Admissions Open 2026-2027',
      title: title || 'Welcome to',
      highlightTitle: highlightTitle || 'S.S. Global Public School',
      description: description || 'Providing premier CBSE curriculum education with smart classrooms and modern facilities.',
      primaryButtonText: primaryButtonText || 'Apply For Admission',
      primaryButtonLink: primaryButtonLink || '/contact',
      secondaryButtonText: secondaryButtonText || 'Explore School Vision',
      secondaryButtonLink: secondaryButtonLink || '/about',
      displayOrder: displayOrder ? parseInt(displayOrder, 10) : 1,
      isActive: isActive === undefined ? true : Boolean(isActive),
      autoPlay: autoPlay === undefined ? true : Boolean(autoPlay),
    });

    return res.status(201).json({
      success: true,
      message: 'Hero slide created successfully',
      slide: newSlide,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/admin/hero-slider/:id
 * Protected Admin endpoint to update an existing hero slide.
 */
export const updateHeroSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findById(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found.',
      });
    }

    const {
      badge,
      title,
      highlightTitle,
      description,
      primaryButtonText,
      primaryButtonLink,
      secondaryButtonText,
      secondaryButtonLink,
      displayOrder,
      isActive,
      autoPlay,
    } = req.body;

    if (badge !== undefined) slide.badge = badge;
    if (title !== undefined) slide.title = title;
    if (highlightTitle !== undefined) slide.highlightTitle = highlightTitle;
    if (description !== undefined) slide.description = description;
    if (primaryButtonText !== undefined) slide.primaryButtonText = primaryButtonText;
    if (primaryButtonLink !== undefined) slide.primaryButtonLink = primaryButtonLink;
    if (secondaryButtonText !== undefined) slide.secondaryButtonText = secondaryButtonText;
    if (secondaryButtonLink !== undefined) slide.secondaryButtonLink = secondaryButtonLink;
    if (displayOrder !== undefined) slide.displayOrder = parseInt(displayOrder, 10);
    if (isActive !== undefined) slide.isActive = Boolean(isActive);
    if (autoPlay !== undefined) slide.autoPlay = Boolean(autoPlay);

    if (req.file) {
      slide.backgroundImage = `/uploads/${req.file.filename}`;
    } else if (req.body.backgroundImage) {
      slide.backgroundImage = req.body.backgroundImage;
    }

    await slide.save();

    return res.status(200).json({
      success: true,
      message: 'Hero slide updated successfully',
      slide,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/admin/hero-slider/:id
 * Protected Admin endpoint to delete a hero slide.
 */
export const deleteHeroSlide = async (req, res, next) => {
  try {
    const { id } = req.params;
    const slide = await HeroSlide.findById(id);

    if (!slide) {
      return res.status(404).json({
        success: false,
        message: 'Hero slide not found.',
      });
    }

    await HeroSlide.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: 'Hero slide deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PATCH /api/admin/hero-slider/reorder
 * Protected Admin endpoint to reorder slides.
 */
export const reorderHeroSlides = async (req, res, next) => {
  try {
    const { orderList } = req.body;

    if (!Array.isArray(orderList)) {
      return res.status(400).json({
        success: false,
        message: 'orderList must be an array of objects containing id and displayOrder',
      });
    }

    const updatePromises = orderList.map((item) =>
      HeroSlide.findByIdAndUpdate(item.id, { displayOrder: parseInt(item.displayOrder, 10) })
    );

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: 'Hero slides reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};
