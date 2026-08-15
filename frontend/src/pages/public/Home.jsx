import React from 'react';
import SEO from '../../components/common/SEO';
import IndependenceDayTicker from '../../components/home/IndependenceDayTicker';
import HeroSection from '../../components/home/HeroSection';
import IndependenceDaySection from '../../components/home/IndependenceDaySection';
import WelcomeMessage from '../../components/home/WelcomeMessage';
import AboutPreview from '../../components/home/AboutPreview';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import StatsSection from '../../components/home/StatsSection';
import FacilitiesPreview from '../../components/home/FacilitiesPreview';
import GalleryPreview from '../../components/home/GalleryPreview';
import VideoGallerySection from '../../components/home/VideoGallerySection';
import LatestNotices from '../../components/home/LatestNotices';
import DownloadsPreview from '../../components/home/DownloadsPreview';
import Testimonials from '../../components/home/Testimonials';
import CallToAction from '../../components/home/CallToAction';
import ContactPreview from '../../components/home/ContactPreview';

const Home = () => {
  const homeSchema = {
    '@context': 'https://schema.org',
    '@type': ['School', 'EducationalOrganization', 'LocalBusiness'],
    'name': 'S.S. Global Public School',
    'alternateName': 'SS Global Public School Daudnagar',
    'url': 'https://www.ssglobalpublicschool.com/',
    'logo': 'https://www.ssglobalpublicschool.com/android-chrome-512x512.png',
    'image': 'https://www.ssglobalpublicschool.com/hero-4.jpg',
    'description': 'Premier CBSE curriculum school in Daudnagar, Bihar offering interactive smart classrooms, computer and science laboratories, sports, and leadership development.',
    'telephone': '+919122490003',
    'email': 'ssglobalpublicschool0@gmail.com',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Daudnagar',
      'addressLocality': 'Daudnagar',
      'addressRegion': 'Bihar',
      'postalCode': '824143',
      'addressCountry': 'IN',
    },
  };

  return (
    <main className="space-y-0">
      <SEO
        title="S.S. Global Public School | Best CBSE School in Daudnagar, Bihar"
        description="S.S. Global Public School, Daudnagar, Bihar is a premier CBSE institution offering interactive smart classrooms, science labs, sports, and holistic character building."
        keywords="S.S. Global Public School, S.S. Global Public School Daudnagar, Best School in Daudnagar, Best CBSE School in Daudnagar, CBSE School in Daudnagar, Top School in Daudnagar, School in Daudnagar Bihar, Best School in Aurangabad Bihar, CBSE School in Aurangabad Bihar, Admissions 2026"
        canonicalUrl="https://www.ssglobalpublicschool.com/"
        jsonLd={homeSchema}
      />
      <IndependenceDayTicker />
      <HeroSection />
      <IndependenceDaySection />
      <WelcomeMessage />
      <AboutPreview />
      <WhyChooseUs />
      <StatsSection />
      <FacilitiesPreview />
      <GalleryPreview />
      <VideoGallerySection />
      <LatestNotices />
      <DownloadsPreview />
      <Testimonials />
      <CallToAction />
      <ContactPreview />
    </main>
  );
};

export default Home;
