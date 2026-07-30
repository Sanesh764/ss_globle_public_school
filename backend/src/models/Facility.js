import mongoose from 'mongoose';

const facilitySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Facility title is required'],
      trim: true,
    },
    shortDescription: {
      type: String,
      required: [true, 'Short description is required'],
      trim: true,
    },
    detailedDescription: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: 'FiCheckCircle',
      trim: true,
    },
    image: {
      type: String,
      default: '',
      trim: true,
    },
    public_id: {
      type: String,
      default: '',
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Facility = mongoose.model('Facility', facilitySchema);
export default Facility;
