import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Notice title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Notice description is required'],
    },
    category: {
      type: String,
      enum: ['Academic', 'Exam', 'Holiday', 'General', 'Admission'],
      default: 'General',
    },
    isImportant: {
      type: Boolean,
      default: false,
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
