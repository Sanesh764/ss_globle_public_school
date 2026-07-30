import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Setting from '../models/Setting.js';
import Notice from '../models/Notice.js';
import Gallery from '../models/Gallery.js';
import Leadership from '../models/Leadership.js';
import HeroSlide from '../models/HeroSlide.js';
import Facility from '../models/Facility.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const seedDatabase = async () => {
  try {
    // 1. Seed Default Admin User
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@ssglobalpublicschool.edu.in';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123456';

    let adminUser = await Admin.findOne({ email: adminEmail });

    if (!adminUser) {
      adminUser = await Admin.create({
        name: 'S.S. Global Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'superadmin',
      });
      console.log(`[Seeding] Created default superadmin account: ${adminEmail}`);
    } else if (adminUser.role !== 'superadmin') {
      adminUser.role = 'superadmin';
      await adminUser.save();
    }

    // 1b. Seed Default Staff Admin User
    const staffEmail = 'staff@ssglobal.edu.in';
    const staffPassword = 'Staff@123';

    let staffUser = await Admin.findOne({ email: staffEmail });

    if (!staffUser) {
      staffUser = await Admin.create({
        name: 'School Staff',
        email: staffEmail,
        password: staffPassword,
        role: 'staff',
        isActive: true,
      });
      console.log(`[Seeding] Created default staff admin account: ${staffEmail}`);
    }

    // 2. Seed Default Settings
    const existingSetting = await Setting.findOne();
    if (!existingSetting) {
      await Setting.create({
        schoolName: 'S.S. Global Public School',
        tagline: 'Empowering minds and shaping future leaders through quality education',
        aboutText:
          'S.S. Global Public School, located in Daudnagar, Bihar, is dedicated to providing holistic education combining academic excellence with moral character building.',
        principalMessage:
          'Welcome to S.S. Global Public School. Our mission is to nurture young minds with knowledge, integrity, and modern educational skills.',
        phone: '+91 98765 43210',
        email: 'info@ssglobalpublicschool.edu.in',
        address: 'Daudnagar, Bihar - 824143, India',
        officeHours: 'Mon - Sat: 8:00 AM - 3:00 PM',
        socialLinks: {
          facebook: 'https://facebook.com',
          instagram: 'https://instagram.com',
          twitter: 'https://twitter.com',
          youtube: 'https://youtube.com',
        },
      });
      console.log('[Seeding] Created default school settings');
    }

    // 3. Seed Default Notices
    const noticesCount = await Notice.countDocuments();
    if (noticesCount === 0) {
      await Notice.insertMany([
        {
          title: 'Admissions Open for Academic Session 2026-27',
          content:
            'Applications are invited for Nursery to Class IX & XI for the upcoming academic session. Visit the school office or contact us for details.',
          category: 'Admission',
          priority: 'High',
          isPinned: true,
          author: 'Principal Office',
        },
        {
          title: 'Annual Sports Meet 2026 Scheduled',
          content:
            'The Annual Sports Meet will be held next month. Students interested in track and field events should register with physical education teachers.',
          category: 'Sports',
          priority: 'Medium',
          isPinned: false,
          author: 'Sports Dept',
        },
        {
          title: 'Parent-Teacher Meeting (PTM) Announcement',
          content:
            'PTM for all classes will take place on Saturday from 9:00 AM to 1:00 PM. Parents are requested to discuss progress reports with class teachers.',
          category: 'Academic',
          priority: 'High',
          isPinned: true,
          author: 'Academic Coordinator',
        },
      ]);
      console.log('[Seeding] Created default notices');
    }

    // 4. Seed Default Gallery Items
    const galleryCount = await Gallery.countDocuments();
    if (galleryCount === 0) {
      await Gallery.insertMany([
        {
          title: 'Modern Smart Science Laboratory',
          category: 'Infrastructure',
          url: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop',
          caption: 'State-of-the-art laboratory facilities equipped for physics, chemistry, and biology practical learning.',
          uploadedBy: adminUser ? adminUser._id : null,
        },
        {
          title: 'Annual Cultural Festival Performance',
          category: 'Events',
          url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1000&auto=format&fit=crop',
          caption: 'Students showcasing traditional dance and music at the annual school gathering.',
          uploadedBy: adminUser ? adminUser._id : null,
        },
        {
          title: 'Inter-House Athletic Championship',
          category: 'Sports',
          url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop',
          caption: 'Spacious sports ground supporting track and field activities for all age groups.',
          uploadedBy: adminUser ? adminUser._id : null,
        },
        {
          title: 'Digital Computer & Robotics Lab',
          category: 'Academics',
          url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop',
          caption: 'High-speed internet enabled computer workstations promoting digital literacy.',
          uploadedBy: adminUser ? adminUser._id : null,
        },
      ]);
      console.log('[Seeding] Created default gallery images');
    }

    // 5. Seed Default Leadership Members
    const leadershipCount = await Leadership.countDocuments();
    if (leadershipCount === 0) {
      await Leadership.insertMany([
        {
          name: 'Shri Saneshwar Prasad',
          role: 'Founder & Managing Director',
          designation: 'Founder & Managing Director',
          message:
            'Our vision is to provide accessible, high-quality education rooted in ethics, discipline, and modern scientific knowledge.',
          image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=800&auto=format&fit=crop',
          displayOrder: 1,
          isPrincipal: false,
        },
        {
          name: 'Dr. Archana Sharma',
          role: 'Principal',
          designation: 'Principal',
          message:
            'At S.S. Global Public School, we empower students to discover their potential through innovative teaching and holistic development.',
          image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop',
          displayOrder: 2,
          isPrincipal: true,
        },
      ]);
      console.log('[Seeding] Created default leadership members');
    }

    // 6. Seed Default Hero Slides
    const heroSlidesCount = await HeroSlide.countDocuments();
    if (heroSlidesCount === 0) {
      await HeroSlide.insertMany([
        {
          backgroundImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop',
          badgeText: 'ADMISSIONS OPEN FOR SESSION 2026-27',
          title: 'Empowering Minds & Shaping Future Leaders',
          highlightTitle: 'Through Quality CBSE Education',
          description: 'S.S. Global Public School provides modern smart classrooms, science labs, sports facilities, and strong moral values in Daudnagar, Bihar.',
          primaryButtonText: 'Apply For Admission',
          primaryButtonLink: '/contact',
          secondaryButtonText: 'Explore Campus',
          secondaryButtonLink: '/about',
          displayOrder: 1,
          isActive: true,
          autoPlay: true,
        },
        {
          backgroundImage: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1600&auto=format&fit=crop',
          badgeText: 'MODERN INFRASTRUCTURE & LABS',
          title: 'State-of-the-Art Science & Digital Computer',
          highlightTitle: 'Interactive Smart Classrooms',
          description: 'Hands-on practical training in physics, chemistry, biology, and robotics laboratories with expert faculty guidance.',
          primaryButtonText: 'View Facilities',
          primaryButtonLink: '/facilities',
          secondaryButtonText: 'Contact Us',
          secondaryButtonLink: '/contact',
          displayOrder: 2,
          isActive: true,
          autoPlay: true,
        },
        {
          backgroundImage: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1600&auto=format&fit=crop',
          badgeText: 'HOLISTIC SPORTS & CULTURAL ACTIVITIES',
          title: 'Excellence In',
          highlightTitle: 'Sports & Athletic Arena',
          description: 'Spacious athletic ground supporting cricket, football, track events, and teamwork encouraging physical fitness and sportsmanship.',
          primaryButtonText: 'Join Sports Arena',
          primaryButtonLink: '/contact',
          secondaryButtonText: 'Explore Gallery',
          secondaryButtonLink: '/gallery',
          displayOrder: 3,
          isActive: true,
          autoPlay: true,
        },
      ]);
      console.log('[Seeding] Initial Hero Slides created in MongoDB');
    }

    // 7. Seed Default Facilities
    const facilityCount = await Facility.countDocuments();
    if (facilityCount === 0) {
      await Facility.insertMany([
        {
          title: 'Smart Classrooms',
          shortDescription: 'Interactive digital boards, multimedia content, and modern ergonomic seating designed for engaging conceptual learning.',
          detailedDescription: 'Our smart classrooms are equipped with high-definition digital interactive panels, audiovisual tools, and high-speed connectivity to make complex lessons intuitive, engaging, and memorable.',
          icon: 'FiMonitor',
          image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?q=80&w=1000&auto=format&fit=crop',
          displayOrder: 1,
          isActive: true,
        },
        {
          title: 'Science Laboratories',
          shortDescription: 'Advanced Physics, Chemistry, and Biology laboratories equipped with modern apparatus for hands-on practical experiments.',
          detailedDescription: 'Fully equipped practical laboratories complying with CBSE standards. Every student receives dedicated workstation access under expert teacher supervision to foster scientific inquiry.',
          icon: 'FiZap',
          image: 'https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1000&auto=format&fit=crop',
          displayOrder: 2,
          isActive: true,
        },
        {
          title: 'Computer & Robotics Lab',
          shortDescription: 'High-speed internet workstations, coding platforms, and foundational robotics learning tools for futuristic digital skills.',
          detailedDescription: 'Modern computer lab featuring latest software suites, coding environments, and safe web access. We teach digital literacy, programming fundamentals, and technology ethics.',
          icon: 'FiCpu',
          image: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1000&auto=format&fit=crop',
          displayOrder: 3,
          isActive: true,
        },
        {
          title: 'Library & Learning Resource Hub',
          shortDescription: 'Vast collection of academic textbooks, reference encyclopedias, fiction, journals, and quiet reading zones.',
          detailedDescription: 'A quiet, well-stocked library housing thousands of books, periodicals, and educational magazines. Fosters a lifelong love for reading and independent research.',
          icon: 'FiBookOpen',
          image: 'https://images.unsplash.com/photo-1521587760476-6c12a4b040da?q=80&w=1000&auto=format&fit=crop',
          displayOrder: 4,
          isActive: true,
        },
        {
          title: 'Sports & Athletics Complex',
          shortDescription: 'Expansive sports ground supporting football, cricket, basketball, athletics, and physical education programs.',
          detailedDescription: 'Dedicated physical education facilities designed to nurture teamwork, sportsmanship, and physical health. Features trained coaches for outdoor and indoor games.',
          icon: 'FiActivity',
          image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?q=80&w=1000&auto=format&fit=crop',
          displayOrder: 5,
          isActive: true,
        },
        {
          title: 'Safe Campus & Transport',
          shortDescription: '24/7 CCTV surveillance, boundary security, GPS-tracked school transport fleet, and trained support staff.',
          detailedDescription: 'Comprehensive campus safety protocols including round-the-clock CCTV monitoring, trained security guards, and reliable school transport equipped with safety measures.',
          icon: 'FiShield',
          image: 'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?q=80&w=1000&auto=format&fit=crop',
          displayOrder: 6,
          isActive: true,
        },
      ]);
      console.log('[Seeding] Initial Facilities created in MongoDB');
    }
  } catch (error) {
    console.error('[Seeding Error]', error.message);
  }
};

export const seedInitialData = seedDatabase;
