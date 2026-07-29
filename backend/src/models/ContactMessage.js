import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Message content is required'],
    },
    state: {
      type: String,
      default: 'Bihar',
      trim: true,
    },
    district: {
      type: String,
      default: 'Aurangabad',
      trim: true,
    },
    city: {
      type: String,
      default: 'Daudnagar',
      trim: true,
    },
    pinCode: {
      type: String,
      default: '',
      trim: true,
    },
    ipAddress: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Unread', 'Read', 'Replied'],
      default: 'Unread',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property for 'name' for backwards compatibility
contactMessageSchema.virtual('name').get(function () {
  return this.fullName;
});

contactMessageSchema.set('toJSON', { virtuals: true });
contactMessageSchema.set('toObject', { virtuals: true });

const ContactMessage = mongoose.model('ContactMessage', contactMessageSchema);
export default ContactMessage;
