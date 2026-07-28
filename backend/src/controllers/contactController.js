import ContactMessage from '../models/ContactMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// @desc    Submit a contact form message
// @route   POST /api/contact
// @access  Public
export const submitContactMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !phone || !message) {
    throw new ApiError(400, 'Name, email, phone, and message are required fields');
  }

  const newMessage = new ContactMessage({
    name,
    email,
    phone,
    subject: subject || 'General Inquiry',
    message,
  });

  const savedMessage = await newMessage.save();

  res.status(201).json(
    new ApiResponse(
      201,
      { contactMessage: savedMessage },
      'Thank you! Your message has been sent successfully. We will get back to you soon.'
    )
  );
});

// @desc    Get all contact messages
// @route   GET /api/contact
// @access  Private/Admin
export const getContactMessages = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 15));

  const count = await ContactMessage.countDocuments();
  const messages = await ContactMessage.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(limit * (page - 1));

  res.status(200).json(
    new ApiResponse(
      200,
      {
        messages,
        totalMessages: count,
        page,
        pages: Math.ceil(count / limit) || 1,
      },
      'Contact messages retrieved successfully'
    )
  );
});

// @desc    Delete contact message
// @route   DELETE /api/contact/:id
// @access  Private/Admin
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    throw new ApiError(404, 'Contact message not found to delete');
  }

  await ContactMessage.findByIdAndDelete(req.params.id);

  res.status(200).json(new ApiResponse(200, {}, 'Contact message deleted successfully'));
});

// @desc    Toggle mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private/Admin
export const toggleReadMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) {
    throw new ApiError(404, 'Contact message not found');
  }

  message.isRead = !message.isRead;
  await message.save();

  res.status(200).json(
    new ApiResponse(200, { isRead: message.isRead }, 'Message status updated')
  );
});
