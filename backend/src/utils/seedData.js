import bcrypt from 'bcryptjs';
import Admin from '../models/Admin.js';
import Setting from '../models/Setting.js';
import Notice from '../models/Notice.js';
import Gallery from '../models/Gallery.js';

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
  } catch (error) {
    console.error('[Seeding Error]', error.message);
  }
};
