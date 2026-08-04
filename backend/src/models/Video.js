import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'YouTube URL is required'],
      trim: true,
    },
    youtubeVideoId: {
      type: String,
      required: [true, 'YouTube Video ID is required'],
      trim: true,
    },
    thumbnail: {
      type: String,
      required: [true, 'Thumbnail URL is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: [
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
      ],
      default: 'Events',
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    provider: {
      type: String,
      enum: ['youtube', 'vimeo', 'facebook', 'instagram', 'drive', 'self_hosted'],
      default: 'youtube',
    },
    createdBy: {
      type: String,
      default: 'Admin',
    },
    updatedBy: {
      type: String,
      default: 'Admin',
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal search and sorting
videoSchema.index({ isActive: 1, isFeatured: -1, displayOrder: 1, createdAt: -1 });
videoSchema.index({ category: 1, isActive: 1 });

const Video = mongoose.model('Video', videoSchema);
export default Video;
