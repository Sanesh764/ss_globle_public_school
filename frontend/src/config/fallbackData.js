/**
 * Centralized Fallback Configuration for S.S. Global Public School
 * 
 * IMPORTANT:
 * - Only approved stable/permanent content fallbacks are defined here.
 * - All image URLs reference verified existing files in frontend/public.
 * - Dynamic content (notices, admissions, events, latest gallery) is EXCLUDED.
 */

export const SCHOOL_DETAILS_FALLBACK = {
  schoolName: 'S.S. Global Public School',
  tagline: 'Excellence in Education, Leadership in Life',
  logo: '/logo.webp',
  heroImage: '/school.webp',
  founderPhoto: '/founder_image.jpeg',
  founderName: 'Shambhu Sharan Singh',
  directorPhoto: '/Director_image.jpeg',
  directorName: 'Er. Manish Singh',
  principalPhoto: '/Principle_image.jpg',
  principalName: 'Ashutosh Kumar',
  location: 'Daudnagar, Bihar, India',
  address: 'Daudnagar, Bihar - 824143, India',
  phone: '+91 98765 43210',
  altPhone: '+91 91234 56789',
  email: 'info@ssglobalpublicschool.edu.in',
  officeHours: 'Monday - Saturday: 8:00 AM - 3:00 PM',
  aboutHeroTitle: 'About S.S. Global Public School',
  aboutHeroSubtitle: 'Dedicated to excellence in education, character building, and leadership in Daudnagar, Bihar.',
  aboutBadge: 'Our Legacy & History',
  aboutTitle: 'Nurturing Potential, Shaping Destiny in Daudnagar',
  aboutText1: 'S.S. Global Public School was established with a singular objective: to bring high quality CBSE education within reach of every student in Daudnagar and surrounding regions. Under visionary guidance, the institution has grown into a premier seat of learning.',
  aboutText2: 'We believe that education must extend beyond textbooks. Our campus blends modern technology with traditional Indian ethics, giving students the tools to compete globally while remaining rooted in strong values.',
  aboutImage: '/school.webp',
  expNumber: '10+',
  expText: 'Years of Educational Excellence',
  vision: 'To create a benchmark educational institution that nurtures confident, compassionate, and globally competent citizens equipped with modern technology and ethical values.',
  mission: 'Providing quality education with modern facilities, smart classrooms, science laboratories, holistic sports, and strong moral grounding for every child.',
  founderMessage: 'Our foundational goal is to provide world-class CBSE education in Daudnagar. We empower students with critical thinking, sportsmanship, technological literacy, and strong moral grounding.',
  directorMessage: 'We believe every child possesses infinite potential. At S.S. Global, we provide modern infrastructure, smart labs, and holistic guidance to turn academic dreams into reality.',
  principalMessage: 'Welcome to S.S. Global Public School. Education is not merely the accumulation of facts, but the training of the mind to think, innovate, and lead with empathy. We strive for holistic excellence.',
};

export const LEADERSHIP_FALLBACK = [
  {
    _id: 'fallback-founder',
    name: 'Shambhu Sharan Singh',
    designation: 'Founder',
    heading: 'Visionary Guidance for Educational Excellence',
    message: 'Our foundational goal is to provide world-class CBSE education in Daudnagar. We empower students with critical thinking, sportsmanship, technological literacy, and strong moral grounding.',
    location: 'Daudnagar, Bihar',
    image: '/founder_image.jpeg',
  },
  {
    _id: 'fallback-director',
    name: 'Er. Manish Singh',
    designation: 'Director',
    heading: 'Innovating Infrastructure & Learning Environment',
    message: 'We believe every child possesses infinite potential. At S.S. Global, we provide modern infrastructure, smart labs, and holistic guidance to turn academic dreams into reality.',
    location: 'Daudnagar, Bihar',
    image: '/Director_image.jpeg',
  },
  {
    _id: 'fallback-principal',
    name: 'Ashutosh Kumar',
    designation: 'Principal',
    heading: 'Building Strong Foundations for Tomorrow',
    message: 'Welcome to S.S. Global Public School. Education is not merely the accumulation of facts, but the training of the mind to think, innovate, and lead with empathy. We strive for holistic excellence.',
    location: 'Daudnagar, Bihar',
    image: '/Principle_image.jpg',
  },
];

export const FACILITIES_FALLBACK = [
  {
    _id: 'fallback-facility-1',
    title: 'Interactive Smart Classrooms',
    shortDescription: 'Equipped with digital touchboards, multi-media projection system, and interactive learning modules for modern education.',
    detailedDescription: 'Interactive smart classrooms feature advanced touchboards and digital learning modules designed for immersive 3D conceptual understanding and active student participation.',
    icon: 'FiMonitor',
    image: '/classes.webp',
  },
  {
    _id: 'fallback-facility-2',
    title: 'Science & Computer Laboratories',
    shortDescription: 'State-of-the-art physics, chemistry, biology, and high-speed computer labs fostering practical experimentation.',
    detailedDescription: 'State-of-the-art laboratories equipped with modern scientific instruments and high-speed computers providing students hands-on practical learning experience.',
    icon: 'FiCpu',
    image: '/front-1.webp',
  },
  {
    _id: 'fallback-facility-3',
    title: 'Well-Stocked Library & Resource Center',
    shortDescription: 'Vast collection of academic books, reference guides, journals, and quiet reading zones.',
    detailedDescription: 'Our spacious library offers thousands of reference books, educational journals, fiction, and non-fiction titles along with comfortable reading spaces.',
    icon: 'FiBookOpen',
    image: '/front-2.webp',
  },
  {
    _id: 'fallback-facility-4',
    title: 'Safe CCTV Transport & Campus Security',
    shortDescription: 'Full campus surveillance and dedicated school transport fleet serving Daudnagar and neighboring areas.',
    detailedDescription: 'Comprehensive 24/7 CCTV surveillance across campus grounds and GPS-tracked school transport ensuring safe transit for all students.',
    icon: 'FiShield',
    image: '/school.webp',
  },
];

export const NEW_FIRST_HERO_SLIDE = {
  _id: 'hero-community-first',
  backgroundImage: '/hero-4.jpg',
  badge: '🏫 Excellence in Education',
  title: 'Building Bright',
  highlightTitle: 'Futures Together',
  subtitle: 'Students, Teachers & Parents Growing as One Community',
  description: 'At S.S. Global Public School, we nurture academic excellence, discipline, confidence, leadership, and holistic development through quality education in a safe and inspiring learning environment.',
  primaryButtonText: 'Apply for Admission',
  primaryButtonLink: '/contact',
  secondaryButtonText: 'Explore Our Campus',
  secondaryButtonLink: '/about',
  autoPlay: true,
};

export const HERO_SLIDES_FALLBACK = [
  NEW_FIRST_HERO_SLIDE,
  {
    _id: 'fallback-hero-1',
    backgroundImage: '/school.webp',
    badge: 'Admissions Open for Academic Session 2026-2027',
    title: 'Welcome to',
    highlightTitle: 'S.S. Global Public School',
    description: 'Located in Daudnagar, Bihar. We provide premier CBSE curriculum education, smart classrooms, state-of-the-art computer & science laboratories, and comprehensive character building.',
    primaryButtonText: 'Apply For Admission',
    primaryButtonLink: '/contact',
    secondaryButtonText: 'Explore School Vision',
    secondaryButtonLink: '/about',
    autoPlay: true,
  },
  {
    _id: 'fallback-hero-2',
    backgroundImage: '/classes.webp',
    badge: 'State-of-the-Art Facilities',
    title: 'Interactive',
    highlightTitle: 'Modern Smart Classrooms',
    description: 'Interactive smart touchboards and digital learning modules designed for immersive 3D conceptual understanding.',
    primaryButtonText: 'Explore Facilities',
    primaryButtonLink: '/facilities',
    secondaryButtonText: 'View Campus',
    secondaryButtonLink: '/gallery',
    autoPlay: true,
  },
  {
    _id: 'fallback-hero-3',
    backgroundImage: '/front-1.webp',
    badge: 'Holistic Personality Development',
    title: 'Excellence In',
    highlightTitle: 'Academics & Sports Arena',
    description: 'Spacious athletic ground supporting sports, track events, and teamwork encouraging physical fitness and discipline.',
    primaryButtonText: 'Contact Administration',
    primaryButtonLink: '/contact',
    secondaryButtonText: 'Explore Gallery',
    secondaryButtonLink: '/gallery',
    autoPlay: true,
  },
];
