import mongoose from 'mongoose';

const gallerySchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: [true, 'Image URL is required'],
    },
    public_id: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      required: [true, 'Image title is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Campus', 'Events', 'Sports', 'Academics', 'Celebrations', 'Facilities'],
      default: 'Campus',
    },
  },
  {
    timestamps: true,
  }
);

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
