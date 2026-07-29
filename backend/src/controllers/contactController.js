import ContactMessage from '../models/ContactMessage.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

/**
 * @desc    Submit a new contact inquiry (Stored directly in MongoDB)
 * @route   POST /api/contact
 * @access  Public
 */
export const submitContactMessage = asyncHandler(async (req, res) => {
  const { fullName, name, email, phone, subject, message, state, district, city, pinCode } = req.body;

  const actualFullName = (fullName || name || '').trim();
  const actualEmail = (email || '').trim();
  const actualPhone = (phone || '').trim();
  const actualSubject = (subject || 'General Inquiry').trim();
  const actualMessage = (message || '').trim();

  if (!actualFullName || !actualEmail || !actualPhone || !actualMessage) {
    throw new ApiError(400, 'Full Name, email, phone number, and message are required fields.');
  }

  // Extract client IP address optionally
  const clientIp =
    req.headers['x-forwarded-for']?.split(',')[0] ||
    req.socket?.remoteAddress ||
    req.ip ||
    '';

  const newInquiry = new ContactMessage({
    fullName: actualFullName,
    email: actualEmail,
    phone: actualPhone,
    subject: actualSubject,
    message: actualMessage,
    state: state || 'Bihar',
    district: district || 'Aurangabad',
    city: city || 'Daudnagar',
    pinCode: pinCode || '',
    ipAddress: clientIp,
    status: 'Unread',
    isRead: false,
  });

  const savedInquiry = await newInquiry.save();

  return res.status(201).json(
    new ApiResponse(
      201,
      { inquiry: savedInquiry },
      'Thank you! Your inquiry has been received. Our team will contact you soon.'
    )
  );
});

/**
 * @desc    Get all inquiries with search, filter, stats, and pagination
 * @route   GET /api/admin/messages
 * @access  Private/Admin
 */
export const getContactMessages = asyncHandler(async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 15));
  const search = req.query.search ? req.query.search.trim() : '';
  const filterStatus = req.query.status ? req.query.status.trim() : 'All';
  const sortOrder = req.query.sort === 'Oldest' ? 1 : -1;

  // Build Filter Query
  const query = {};

  if (filterStatus && filterStatus !== 'All') {
    if (filterStatus === 'Newest' || filterStatus === 'Oldest') {
      // Sort handled via sortOrder
    } else {
      query.status = filterStatus;
    }
  }

  if (search) {
    query.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } },
      { subject: { $regex: search, $options: 'i' } },
      { city: { $regex: search, $options: 'i' } },
    ];
  }

  // Calculate Key Stats
  const totalInquiries = await ContactMessage.countDocuments();
  const unreadCount = await ContactMessage.countDocuments({ status: 'Unread' });

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const todayInquiries = await ContactMessage.countDocuments({ createdAt: { $gte: startOfToday } });

  // Fetch Filtered Messages
  const count = await ContactMessage.countDocuments(query);
  const messages = await ContactMessage.find(query)
    .sort({ createdAt: sortOrder })
    .limit(limit)
    .skip(limit * (page - 1));

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages,
        stats: {
          totalInquiries,
          unreadCount,
          todayInquiries,
        },
        totalMessages: count,
        page,
        pages: Math.ceil(count / limit) || 1,
      },
      'Inquiries retrieved successfully'
    )
  );
});

/**
 * @desc    Get single inquiry detail
 * @route   GET /api/admin/messages/:id
 * @access  Private/Admin
 */
export const getContactMessageById = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    throw new ApiError(404, 'Inquiry message not found.');
  }

  return res.status(200).json(
    new ApiResponse(200, { message }, 'Inquiry retrieved successfully')
  );
});

/**
 * @desc    Mark inquiry status as Read
 * @route   PATCH /api/admin/messages/:id/read
 * @access  Private/Admin
 */
export const markMessageAsRead = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) {
    throw new ApiError(404, 'Inquiry message not found.');
  }

  message.status = 'Read';
  message.isRead = true;
  await message.save();

  return res.status(200).json(
    new ApiResponse(200, { message }, 'Inquiry marked as Read.')
  );
});

/**
 * @desc    Mark inquiry status as Replied
 * @route   PATCH /api/admin/messages/:id/replied
 * @access  Private/Admin
 */
export const markMessageAsReplied = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);
  if (!message) {
    throw new ApiError(404, 'Inquiry message not found.');
  }

  message.status = 'Replied';
  message.isRead = true;
  await message.save();

  return res.status(200).json(
    new ApiResponse(200, { message }, 'Inquiry marked as Replied.')
  );
});

/**
 * @desc    Delete contact inquiry
 * @route   DELETE /api/admin/messages/:id
 * @access  Private/Admin
 */
export const deleteContactMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findById(req.params.id);

  if (!message) {
    throw new ApiError(404, 'Inquiry message not found to delete.');
  }

  await ContactMessage.findByIdAndDelete(req.params.id);

  return res.status(200).json(
    new ApiResponse(200, {}, 'Inquiry deleted successfully.')
  );
});
