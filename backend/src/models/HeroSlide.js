import mongoose from 'mongoose';

const heroSlideSchema = new mongoose.Schema(
  {
    backgroundImage: {
      type: String,
      required: [true, 'Background image is required'],
    },
    badge: {
      type: String,
      default: 'Admissions Open 2026-2027',
      trim: true,
    },
    title: {
      type: String,
      default: 'Welcome to',
      trim: true,
    },
    highlightTitle: {
      type: String,
      default: 'S.S. Global Public School',
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Slide description is required'],
    },
    primaryButtonText: {
      type: String,
      default: 'Apply For Admission',
      trim: true,
    },
    primaryButtonLink: {
      type: String,
      default: '/contact',
      trim: true,
    },
    secondaryButtonText: {
      type: String,
      default: 'Explore School Vision',
      trim: true,
    },
    secondaryButtonLink: {
      type: String,
      default: '/about',
      trim: true,
    },
    displayOrder: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    autoPlay: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const HeroSlide = mongoose.model('HeroSlide', heroSlideSchema);
export default HeroSlide;
