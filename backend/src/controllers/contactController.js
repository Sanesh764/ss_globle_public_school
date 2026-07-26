import ContactMessage from '../models/ContactMessage.js';

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    const newMessage = new ContactMessage({
      name,
      email,
      phone,
      subject: subject || 'General Inquiry',
      message,
    });

    const savedMessage = await newMessage.save();
    res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent successfully. We will get back to you soon.',
      contactMessage: savedMessage,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
export const getContactMessages = async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 15;

    const count = await ContactMessage.countDocuments();
    const messages = await ContactMessage.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(limit * (page - 1));

    res.json({
      success: true,
      messages,
      totalMessages: count,
      page,
      pages: Math.ceil(count / limit),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContactMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }

    await ContactMessage.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
export const toggleReadMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ success: false, message: 'Message not found' });
    }
    message.isRead = !message.isRead;
    await message.save();
    res.json({ success: true, message: 'Status updated', isRead: message.isRead });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
