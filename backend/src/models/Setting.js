import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema(
  {
    schoolName: {
      type: String,
      default: 'S.S. Global Public School',
    },
    tagline: {
      type: String,
      default: 'Empowering Minds, Shaping Future Leaders',
    },
    logo: {
      type: String,
      default: '/logo.jpg',
    },
    heroImage: {
      type: String,
      default: '/school.jpeg',
    },
    principalPhoto: {
      type: String,
      default: '/principle.png',
    },
    address: {
      type: String,
      default: 'Daudnagar, Bihar - 824143, India',
    },
    phone: {
      type: String,
      default: '+91 98765 43210',
    },
    altPhone: {
      type: String,
      default: '+91 91234 56789',
    },
    email: {
      type: String,
      default: 'info@ssglobalpublicschool.edu.in',
    },
    principalMessage: {
      type: String,
      default: 'Welcome to S.S. Global Public School. Our commitment is to foster academic excellence, holistic development, and moral values in a modern learning environment.',
    },
    principalName: {
      type: String,
      default: 'Manish Singh',
    },
    directorMessage: {
      type: String,
      default: 'We believe every child has infinite potential. At S.S. Global, we provide world-class infrastructure and guidance to turn dreams into reality.',
    },
    directorName: {
      type: String,
      default: 'Er. R. P. Singh',
    },
    about: {
      type: String,
      default: 'S.S. Global Public School in Daudnagar, Bihar is dedicated to offering contemporary CBSE curriculum education focused on innovation, discipline, leadership, and lifelong learning.',
    },
    vision: {
      type: String,
      default: 'To create a benchmark educational institution that nurtures confident, compassionate, and global citizens.',
    },
    mission: {
      type: String,
      default: 'Providing quality education with modern facilities, holistic sports, smart learning tools, and strong moral grounding.',
    },
    socialLinks: {
      facebook: { type: String, default: 'https://facebook.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      instagram: { type: String, default: 'https://instagram.com' },
      youtube: { type: String, default: 'https://youtube.com' },
    },
    officeHours: {
      type: String,
      default: 'Mon - Sat: 8:00 AM - 3:00 PM',
    },
    googleMapUrl: {
      type: String,
      default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.942738743126!2d84.39864225!3d25.034509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398d5c89839446d3%3A0x6b19451ba21d604b!2sDaudnagar%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    },
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
