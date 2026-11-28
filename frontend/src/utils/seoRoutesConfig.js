export const DEFAULT_SOCIAL_IMAGE = 'https://www.ssglobalpublicschool.com/school.webp';

/**
 * Single source of truth for all indexable public route SEO metadata.
 */
export const PUBLIC_ROUTE_SEO = {
  '/': {
    path: '/',
    title: 'S.S. Global Public School, Daudnagar | CBSE English Medium',
    description:
      'S.S. Global Public School is a CBSE-affiliated English medium school in Daudnagar, Aurangabad district, Bihar, offering Classes 1 to 12 with smart classrooms and labs.',
    canonicalUrl: 'https://www.ssglobalpublicschool.com/',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
  '/about': {
    path: '/about',
    title: 'About Us | S.S. Global Public School, Daudnagar',
    description:
      'Learn about the history, vision, leadership, and educational approach of S.S. Global Public School, a CBSE-affiliated English medium school in Daudnagar, Aurangabad district.',
    canonicalUrl: 'https://www.ssglobalpublicschool.com/about',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
  '/facilities': {
    path: '/facilities',
    title: 'Campus Facilities | S.S. Global Public School, Daudnagar',
    description:
      'Explore campus facilities at S.S. Global Public School in Daudnagar, Bihar, including smart classrooms, science and computer labs, library, and school transport.',
    canonicalUrl: 'https://www.ssglobalpublicschool.com/facilities',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
  '/gallery': {
    path: '/gallery',
    title: 'Photo Gallery | S.S. Global Public School, Daudnagar',
    description:
      'Browse campus photographs, student activities, sports events, and school celebrations at S.S. Global Public School in Daudnagar, Aurangabad district, Bihar.',
    canonicalUrl: 'https://www.ssglobalpublicschool.com/gallery',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
  '/videos': {
    path: '/videos',
    title: 'Video Gallery | S.S. Global Public School, Daudnagar',
    description:
      'Watch official campus videos, classroom activities, annual functions, and sports events from S.S. Global Public School in Daudnagar, Bihar.',
    canonicalUrl: 'https://www.ssglobalpublicschool.com/videos',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
  '/notices': {
    path: '/notices',
    title: 'School Notices & Circulars | S.S. Global Public School',
    description:
      'Read official school notices, examination date sheets, holiday circulars, and admission announcements from S.S. Global Public School in Daudnagar, Bihar.',
    canonicalUrl: 'https://www.ssglobalpublicschool.com/notices',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
  '/downloads': {
    path: '/downloads',
    title: 'Academic Resources | S.S. Global Public School, Daudnagar',
    description:
      'Download official academic calendars, syllabus documents, book lists, and examination schedules from S.S. Global Public School in Daudnagar, Bihar.',
    canonicalUrl: 'https://www.ssglobalpublicschool.com/downloads',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
  '/contact': {
    path: '/contact',
    title: 'Contact & Location | S.S. Global Public School, Daudnagar',
    description:
      "Contact S.S. Global Public School at Shambhu Nagar, Near Teacher's Training College, Daudnagar, Bihar 824143. Call +91 9122490003 or submit an enquiry online.",
    canonicalUrl: 'https://www.ssglobalpublicschool.com/contact',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
  '/register': {
    path: '/register',
    title: 'Student Registration | S.S. Global Public School, Daudnagar',
    description:
      'Submit an online student registration application for Classes 1 to 12 at S.S. Global Public School in Daudnagar, Aurangabad district, Bihar. No login required.',
    canonicalUrl: 'https://www.ssglobalpublicschool.com/register',
    ogImage: DEFAULT_SOCIAL_IMAGE,
  },
};

export const PUBLIC_ROUTE_SEO_LIST = Object.values(PUBLIC_ROUTE_SEO);
