import mongoose from 'mongoose';

const featureSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    icon: { type: String, default: 'FiCheckCircle' },
  },
  { _id: true }
);

const settingSchema = new mongoose.Schema(
  {
    // General Branding
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
    logoPublicId: {
      type: String,
      default: '',
    },
    favicon: {
      type: String,
      default: '/favicon.ico',
    },
    admissionButtonText: {
      type: String,
      default: 'Admission Open 2026-27',
    },
    admissionButtonLink: {
      type: String,
      default: '/contact',
    },
    heroImage: {
      type: String,
      default: '/school.jpeg',
    },

    // About Hero Header
    aboutHeroTitle: {
      type: String,
      default: 'About S.S. Global Public School',
    },
    aboutHeroSubtitle: {
      type: String,
      default: 'Nurturing curiosity, character, and academic excellence in Daudnagar, Bihar since 2011.',
    },
    aboutHeroBgImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop',
    },
    aboutHeroBgImagePublicId: {
      type: String,
      default: '',
    },

    // About Main Content
    aboutBadge: {
      type: String,
      default: 'ABOUT OUR INSTITUTE',
    },
    aboutTitle: {
      type: String,
      default: 'Dedicated to Excellence in Education & Character Building',
    },
    aboutText: {
      type: String,
      default: 'S.S. Global Public School in Daudnagar, Bihar is dedicated to offering contemporary CBSE curriculum education focused on innovation, discipline, leadership, and lifelong learning.',
    },
    aboutText1: {
      type: String,
      default: 'Founded with a vision to revolutionize learning in rural and semi-urban Bihar, S.S. Global Public School provides state-of-the-art academic infrastructure, smart classrooms, advanced science and robotics labs, and comprehensive physical education programs.',
    },
    aboutText2: {
      type: String,
      default: 'Our dedicated faculty members foster a warm, inclusive, and disciplined environment where every child is encouraged to achieve academic excellence, discover personal talents, and build strong moral character.',
    },
    aboutImage: {
      type: String,
      default: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1000&auto=format&fit=crop',
    },
    aboutImagePublicId: {
      type: String,
      default: '',
    },
    aboutExpNumber: {
      type: String,
      default: '15+',
    },
    aboutExpText: {
      type: String,
      default: 'Years of Educational Excellence',
    },
    aboutFeatures: {
      type: [String],
      default: [
        'Comprehensive CBSE Curriculum',
        'State-of-the-Art Smart Classrooms',
        'Experienced & Dedicated Faculty',
        'Holistic Sports & Cultural Programs',
      ],
    },
    aboutFeaturesList: {
      type: [featureSchema],
      default: [
        { title: 'Affiliated & aligned with CBSE Academic Standards', icon: 'FiCheckCircle' },
        { title: 'Interactive Smart Classrooms & Digital Learning', icon: 'FiMonitor' },
        { title: 'Comprehensive Science & Robotics Laboratories', icon: 'FiCpu' },
        { title: 'Safe CCTV-Monitored Transport System in Daudnagar', icon: 'FiShield' },
        { title: 'Dedicated Focus on Sports & Holistic Personality Development', icon: 'FiActivity' },
        { title: 'Individual Attention under Principal Leadership', icon: 'FiBookOpen' },
      ],
    },
    aboutButtonText: {
      type: String,
      default: 'Learn More About Us',
    },
    aboutButtonLink: {
      type: String,
      default: '/about',
    },

    // Contact Information
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
    officeHours: {
      type: String,
      default: 'Mon - Sat: 8:00 AM - 3:00 PM',
    },
    googleMapUrl: {
      type: String,
      default: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14457.942738743126!2d84.39864225!3d25.034509!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x398d5c89839446d3%3A0x6b19451ba21d604b!2sDaudnagar%2C%20Bihar!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin',
    },

    // Leadership & Additional Content
    principalPhoto: {
      type: String,
      default: '/Principle_image.jpg',
    },
    principalPhotoPublicId: {
      type: String,
      default: '',
    },
    principalName: {
      type: String,
      default: 'Ashutosh Kumar',
    },
    principalMessage: {
      type: String,
      default: 'Welcome to S.S. Global Public School. Our commitment is to foster academic excellence, holistic development, and moral values in a modern learning environment.',
    },
    directorPhoto: {
      type: String,
      default: '/Director_image.jpeg',
    },
    directorPhotoPublicId: {
      type: String,
      default: '',
    },
    directorName: {
      type: String,
      default: 'Er. Manish Singh',
    },
    directorMessage: {
      type: String,
      default: 'We believe every child has infinite potential. At S.S. Global, we provide world-class infrastructure and guidance to turn dreams into reality.',
    },
    founderPhoto: {
      type: String,
      default: '/founder_image.jpeg',
    },
    founderPhotoPublicId: {
      type: String,
      default: '',
    },
    founderName: {
      type: String,
      default: 'Shambhu Sharan Singh',
    },
    founderMessage: {
      type: String,
      default: 'Our foundational goal is to provide world-class CBSE education in Daudnagar.',
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
  },
  {
    timestamps: true,
  }
);

const Setting = mongoose.model('Setting', settingSchema);
export default Setting;
