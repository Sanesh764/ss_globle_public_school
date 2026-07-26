import Notice from '../models/Notice.js';

// @desc    Get all notices (with pagination & search & filter)
// @route   GET /api/notices
// @access  Public
export const getNotices = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search ? req.query.search.trim() : '';
    const category = req.query.category ? req.query.category : '';

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

    res.json({
      success: true,
      notices,
      page,
      pages: Math.ceil(count / limit),
      totalNotices: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single notice by ID
// @route   GET /api/notices/:id
// @access  Public
export const getNoticeById = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id).populate('createdBy', 'name email');
    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }
    res.json({ success: true, notice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new notice
// @route   POST /api/notices
// @access  Private/Admin
export const createNotice = async (req, res) => {
  try {
    const { title, description, category, isImportant, attachmentUrl } = req.body;

    const notice = new Notice({
      title,
      description,
      category: category || 'General',
      isImportant: Boolean(isImportant),
      attachmentUrl: attachmentUrl || '',
      createdBy: req.admin ? req.admin._id : null,
    });

    const createdNotice = await notice.save();
    res.status(201).json({ success: true, notice: createdNotice, message: 'Notice published successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update notice
// @route   PUT /api/notices/:id
// @access  Private/Admin
export const updateNotice = async (req, res) => {
  try {
    const { title, description, category, isImportant, attachmentUrl } = req.body;
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    notice.title = title || notice.title;
    notice.description = description || notice.description;
    notice.category = category || notice.category;
    notice.isImportant = isImportant !== undefined ? isImportant : notice.isImportant;
    notice.attachmentUrl = attachmentUrl !== undefined ? attachmentUrl : notice.attachmentUrl;

    const updatedNotice = await notice.save();
    res.json({ success: true, notice: updatedNotice, message: 'Notice updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete notice
// @route   DELETE /api/notices/:id
// @access  Private/Admin
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);

    if (!notice) {
      return res.status(404).json({ success: false, message: 'Notice not found' });
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Notice deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
