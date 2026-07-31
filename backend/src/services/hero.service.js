import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const slideMetadataConfig = {
  'front-1': {
    badge: 'Admissions Open for Academic Session 2026-2027',
    title: 'Welcome to',
    highlightTitle: 'S.S. Global Public School',
    description: 'Providing premier CBSE curriculum with smart classrooms, science laboratories, sports, and holistic character development.',
    primaryButtonText: 'Apply For Admission',
    primaryButtonLink: '/contact',
    secondaryButtonText: 'Explore School Vision',
    secondaryButtonLink: '/about',
  },
  'front-2': {
    badge: 'State-of-the-Art Facilities',
    title: 'Interactive',
    highlightTitle: 'Modern Smart Classrooms',
    description: 'Interactive smart touchboards and digital learning modules designed for immersive 3D conceptual understanding.',
    primaryButtonText: 'Explore Facilities',
    primaryButtonLink: '/facilities',
    secondaryButtonText: 'View Campus',
    secondaryButtonLink: '/gallery',
  },
  'front-3': {
    badge: 'Practical Learning',
    title: 'Innovation In',
    highlightTitle: 'Science & Computer Labs',
    description: 'Hands-on practical learning with modern computer systems, physics, chemistry, and biology workstations in Daudnagar.',
    primaryButtonText: 'Discover Labs',
    primaryButtonLink: '/facilities',
    secondaryButtonText: 'Explore School',
    secondaryButtonLink: '/about',
  },
  'front-4': {
    badge: 'Holistic Personality Development',
    title: 'Excellence In',
    highlightTitle: 'Sports & Athletics Ground',
    description: 'Spacious athletic ground supporting cricket, football, track events, and teamwork encouraging physical fitness and discipline.',
    primaryButtonText: 'Join Sports Arena',
    primaryButtonLink: '/contact',
    secondaryButtonText: 'View Activities',
    secondaryButtonLink: '/gallery',
  },
  'front-5': {
    badge: 'Excellence in Leadership',
    title: 'Shaping The',
    highlightTitle: 'Future Leaders of Tomorrow',
    description: 'Nurturing curiosity, ethical leadership, public speaking, and cultural values to build well-rounded global citizens.',
    primaryButtonText: 'Admissions Info',
    primaryButtonLink: '/contact',
    secondaryButtonText: 'Learn More',
    secondaryButtonLink: '/about',
  },
};

const defaultSlideMetadata = {
  badge: 'CBSE Curriculum School',
  title: 'S.S. Global Public School',
  highlightTitle: 'Empowering Future Leaders',
  description: 'Situated in Daudnagar, Bihar, S.S. Global Public School is committed to delivering holistic education blending academic rigour with strong moral values.',
  primaryButtonText: 'Learn More',
  primaryButtonLink: '/about',
  secondaryButtonText: 'Contact Us',
  secondaryButtonLink: '/contact',
};

const SUPPORTED_EXTENSIONS = ['.webp', '.jpg', '.jpeg', '.png'];

/**
 * Scans /uploads directory specifically for front-1, front-2, front-3, front-4, front-5...
 * Auto-detects supported extensions (.webp, .jpg, .jpeg, .png).
 * Sorts naturally and returns mapped slide objects with relative image URLs.
 */
export const getHeroSlidesService = () => {
  const uploadsDir = path.join(__dirname, '../../uploads');

  if (!fs.existsSync(uploadsDir)) {
    return getFallbackSlides();
  }

  const files = fs.readdirSync(uploadsDir);

  const frontSlidesMap = new Map();

  files.forEach((file) => {
    const lower = file.toLowerCase();
    const match = lower.match(/^(front[-_]?\d+)\.(webp|jpg|jpeg|png)$/i);
    if (match) {
      const rawKey = match[1].replace('_', '-');
      const ext = path.extname(file).toLowerCase();

      if (!frontSlidesMap.has(rawKey)) {
        frontSlidesMap.set(rawKey, []);
      }
      frontSlidesMap.get(rawKey).push({ filename: file, ext });
    }
  });

  if (frontSlidesMap.size === 0) {
    return getFallbackSlides();
  }

  const extractNum = (str) => {
    const match = str.match(/\d+/);
    return match ? parseInt(match[0], 10) : 0;
  };

  const sortedKeys = Array.from(frontSlidesMap.keys()).sort((a, b) => extractNum(a) - extractNum(b));

  const slides = sortedKeys.map((key) => {
    const fileVariants = frontSlidesMap.get(key);

    fileVariants.sort((a, b) => {
      const idxA = SUPPORTED_EXTENSIONS.indexOf(a.ext);
      const idxB = SUPPORTED_EXTENSIONS.indexOf(b.ext);
      return (idxA === -1 ? 99 : idxA) - (idxB === -1 ? 99 : idxB);
    });

    const chosenFile = fileVariants[0].filename;
    const meta = slideMetadataConfig[key] || defaultSlideMetadata;

    return {
      _id: key,
      id: key,
      filename: chosenFile,
      backgroundImage: `/uploads/${chosenFile}`,
      badge: meta.badge,
      title: meta.title,
      highlightTitle: meta.highlightTitle,
      description: meta.description,
      primaryButtonText: meta.primaryButtonText,
      primaryButtonLink: meta.primaryButtonLink,
      secondaryButtonText: meta.secondaryButtonText,
      secondaryButtonLink: meta.secondaryButtonLink,
      displayOrder: extractNum(key),
      isActive: true,
      autoPlay: true,
    };
  });

  return slides;
};

const getFallbackSlides = () => {
  return [
    {
      _id: 'default-1',
      id: 'default-1',
      filename: 'school.webp',
      backgroundImage: '/school.webp',
      badge: 'Admissions Open for Academic Session 2026-2027',
      title: 'Welcome to',
      highlightTitle: 'S.S. Global Public School',
      description: 'Providing premier CBSE curriculum with smart classrooms, science laboratories, sports, and holistic character development.',
      primaryButtonText: 'Apply For Admission',
      primaryButtonLink: '/contact',
      secondaryButtonText: 'Explore School Vision',
      secondaryButtonLink: '/about',
      displayOrder: 1,
      isActive: true,
      autoPlay: true,
    },
  ];
};
