import mongoose from 'mongoose';

const leadershipSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    designation: {
      type: String,
      required: [true, 'Designation is required'],
      trim: true,
    },
    heading: {
      type: String,
      default: 'Building Strong Foundations',
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Leadership message is required'],
    },
    location: {
      type: String,
      default: 'Daudnagar, Bihar',
      trim: true,
    },
    image: {
      type: String,
      required: [true, 'Profile image is required'],
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    showOnHomepage: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Leadership = mongoose.model('Leadership', leadershipSchema);
export default Leadership;
