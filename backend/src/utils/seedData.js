import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Setting from '../models/Setting.js';
import Notice from '../models/Notice.js';
import Gallery from '../models/Gallery.js';
import Leadership from '../models/Leadership.js';
import HeroSlide from '../models/HeroSlide.js';

export const seedInitialData = async () => {
  try {
    // 1. Seed Admin
    const adminExists = await Admin.findOne({ email: 'admin@ssglobal.edu.in' });
    let adminUser = adminExists;
    if (!adminExists) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123456', salt);
      adminUser = await Admin.create({
        name: 'Administrator',
        email: 'admin@ssglobal.edu.in',
        password: hashedPassword,
        role: 'admin',
      });
      console.log('[Seeding] Initial admin created (email: admin@ssglobal.edu.in, password: Admin@123456)');
    }

    // 2. Seed or Update Settings
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        schoolName: 'S.S. Global Public School',
        tagline: 'Excellence in Education, Leadership in Life',
        logo: '/logo.jpg',
        heroImage: '/school.jpeg',
        principalPhoto: '/principle.png',
        address: 'Daudnagar, Bihar - 824143, India',
        phone: '+91 98765 43210',
        altPhone: '+91 91234 56789',
        email: 'info@ssglobalpublicschool.edu.in',
        principalName: 'Manish Singh',
        principalMessage: 'Welcome to S.S. Global Public School, Daudnagar. We nurture future leaders with modern digital tools, strong moral values, and global pedagogical practices.',
        directorName: 'Er. R. P. Singh (B.Tech)',
        directorMessage: 'Our vision is to provide world-class CBSE education in Daudnagar. We empower students with critical thinking, sportsmanship, and technological literacy.',
        about: 'S.S. Global Public School is a premier educational institution situated in Daudnagar, Bihar. Established with a vision to revolutionize school education, we provide state-of-the-art infrastructure, smart classrooms, well-equipped science and computer laboratories, a comprehensive library, and dedicated sports facilities.',
        vision: 'To build a center of educational excellence that fosters innovation, moral integrity, leadership skills, and global competence among all learners.',
        mission: 'To impart holistic education blending modern technology with traditional values, empowering every student to excel academically and socially.',
        officeHours: 'Monday - Saturday: 8:00 AM - 3:00 PM',
        socialLinks: {
          facebook: 'https://facebook.com/ssglobalpublicschool',
          twitter: 'https://twitter.com/ssglobalschool',
          instagram: 'https://instagram.com/ssglobalschool',
          youtube: 'https://youtube.com/ssglobalschool',
        },
      });
      console.log('[Seeding] Initial school settings created');
    } else {
      setting.principalName = 'Manish Singh';
      setting.logo = '/logo.jpg';
      setting.heroImage = '/school.jpeg';
      setting.principalPhoto = '/principle.png';
      await setting.save();
      console.log('[Seeding] School settings updated with Principal Manish Singh and public image assets');
    }

    // 3. Seed Notices if empty
    const noticesCount = await Notice.countDocuments();
    if (noticesCount === 0) {
      await Notice.insertMany([
        {
          title: 'Admissions Open for Session 2026-2027 (Nursery to Class XII)',
          description: 'Applications are invited for admission to Nursery through Class XII. Registration forms can be collected from the school administrative office or submitted online.',
          category: 'Admission',
          isImportant: true,
          createdBy: adminUser ? adminUser._id : null,
        },
        {
          title: 'Annual Sports Meet & Cultural Fiesta 2026',
          description: 'The Annual Sports Day and Cultural Meet will be held on December 15th. All students are requested to complete track event registrations with their house captains.',
          category: 'General',
          isImportant: true,
          createdBy: adminUser ? adminUser._id : null,
        },
        {
          title: 'Schedule for Mid-Term Examinations 2026',
          description: 'The Mid-Term theory & practical examinations for Classes VI to XII commence from September 10th. Detailed date sheet is published on the notice board.',
          category: 'Exam',
          isImportant: false,
          createdBy: adminUser ? adminUser._id : null,
        },
        {
          title: 'Declaration of Dussehra & Diwali Holidays',
          description: 'The school will remain closed for festive holidays from October 12th to October 24th. Regular classes will resume on October 25th as per normal schedule.',
          category: 'Holiday',
          isImportant: false,
          createdBy: adminUser ? adminUser._id : null,
        },
      ]);
      
      console.log('[Seeding] Initial notices created');
    }

    // 4. Reset & Seed Gallery with all newly uploaded public images
    await Gallery.deleteMany({});

    await Gallery.insertMany([
      {
        title: 'Interactive Smart Classroom',
        category: 'Facilities',
        image: '/classRoom.jpg',
      },
      {
        title: 'Academic Classroom Session',
        category: 'Academics',
        image: '/classes.jpg',
      },
      {
        title: 'Annual Sports Day & Athletics Ground',
        category: 'Sports',
        image: '/sports.jpg',
      },
      {
        title: 'S.S. Global Public School Main Campus',
        category: 'Campus',
        image: '/school.jpeg',
      },
      {
        title: 'Principal Manish Singh Addressing Students',
        category: 'Campus',
        image: '/principle.png',
      },
      {
        title: 'Official School Crest & Insignia',
        category: 'Facilities',
        image: '/logo.jpg',
      },
    ]);

    console.log('[Seeding] Gallery re-seeded with classRoom.jpg, classes.jpg, sports.jpg, school.jpeg, principle.png, logo.jpg');

    // 5. Seed Leadership Profiles if empty
    const leadershipCount = await Leadership.countDocuments();
    if (leadershipCount === 0) {
      await Leadership.insertMany([
        {
          name: 'Er. R. P. Singh (B.Tech)',
          designation: 'Founder & Director',
          heading: 'Empowering Future Leaders & Innovators',
          message: 'Our vision is to provide world-class CBSE education in Daudnagar. We empower students with critical thinking, sportsmanship, technological literacy, and strong moral grounding.',
          location: 'Daudnagar, Bihar',
          image: '/school.webp',
          displayOrder: 1,
          isActive: true,
          showOnHomepage: true,
        },
        {
          name: 'Smt. Gayatri Devi',
          designation: 'Co-Founder & Academic Patron',
          heading: 'Instilling Values & Ethical Integrity',
          message: 'Education is the lamp that illuminates wisdom and empathy. We are committed to nurturing every child in Daudnagar with maternal care, academic discipline, and Indian heritage.',
          location: 'Daudnagar, Bihar',
          image: '/logo.webp',
          displayOrder: 2,
          isActive: true,
          showOnHomepage: true,
        },
        {
          name: 'Manish Singh',
          designation: 'Principal',
          heading: 'Building Strong Foundations for Tomorrow',
          message: 'Welcome to S.S. Global Public School. Education is not merely the accumulation of facts, but the training of the mind to think, innovate, and lead with empathy. We strive for excellence.',
          location: 'Daudnagar, Bihar',
          image: '/principle.webp',
          displayOrder: 3,
          isActive: true,
          showOnHomepage: true,
        },
      ]);
      console.log('[Seeding] Initial Leadership members created (Founder, Co-Founder, Principal)');
    }

    // 6. Seed Hero Slides if empty
    const heroSlidesCount = await HeroSlide.countDocuments();
    if (heroSlidesCount === 0) {
      await HeroSlide.insertMany([
        {
          backgroundImage: '/school.webp',
          badge: 'Admissions Open for Academic Session 2026-2027',
          title: 'Welcome to',
          highlightTitle: 'S.S. Global Public School',
          description: 'Located in Daudnagar, Bihar. We provide premier CBSE curriculum education, smart classrooms, state-of-the-art computer & science laboratories, and comprehensive character building under Principal Manish Singh.',
          primaryButtonText: 'Apply For Admission',
          primaryButtonLink: '/contact',
          secondaryButtonText: 'Explore School Vision',
          secondaryButtonLink: '/about',
          displayOrder: 1,
          isActive: true,
          autoPlay: true,
        },
        {
          backgroundImage: '/classRoom.webp',
          badge: 'State-of-the-Art Facilities',
          title: 'Interactive',
          highlightTitle: 'Modern Smart Classrooms',
          description: 'Interactive smart touchboards and digital learning modules designed for immersive 3D conceptual understanding and digital literacy.',
          primaryButtonText: 'Explore Facilities',
          primaryButtonLink: '/facilities',
          secondaryButtonText: 'View Campus',
          secondaryButtonLink: '/gallery',
          displayOrder: 2,
          isActive: true,
          autoPlay: true,
        },
        {
          backgroundImage: '/sports.webp',
          badge: 'Holistic Personality Development',
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
  } catch (error) {
    console.error('[Seeding Error]', error.message);
  }
};
