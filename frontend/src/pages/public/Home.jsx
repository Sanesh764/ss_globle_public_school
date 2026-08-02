import React from 'react';
import SEO from '../../components/common/SEO';
import HeroSection from '../../components/home/HeroSection';
import WelcomeMessage from '../../components/home/WelcomeMessage';
import AboutPreview from '../../components/home/AboutPreview';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import StatsSection from '../../components/home/StatsSection';
import FacilitiesPreview from '../../components/home/FacilitiesPreview';
import GalleryPreview from '../../components/home/GalleryPreview';
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
    'url': 'https://ssglobalpublicschool.com/',
    'logo': 'https://ssglobalpublicschool.com/android-chrome-512x512.png',
    'image': 'https://ssglobalpublicschool.com/school.webp',
    'description': 'Premier CBSE curriculum school in Daudnagar, Bihar offering interactive smart classrooms, computer and science laboratories, sports, and leadership development.',
    'telephone': '+919876543210',
    'email': 'info@ssglobalpublicschool.edu.in',
    'address': {
      '@type': 'PostalAddress',
      'streetAddress': 'Daudnagar',
      'addressLocality': 'Daudnagar',
      'addressRegion': 'Bihar',
      'postalCode': '824143',
      'addressCountry': 'IN',
    },
    'geo': {
      '@type': 'GeoCoordinates',
      'latitude': '24.9800',
      'longitude': '84.4000',
    },
    'sameAs': [
      'https://facebook.com/ssglobalpublicschool',
      'https://twitter.com/ssglobalschool',
      'https://instagram.com/ssglobalschool',
      'https://youtube.com/ssglobalschool',
    ],
  };

  return (
    <main className="space-y-0">
      <SEO
        title="S.S. Global Public School | Best CBSE School in Daudnagar, Bihar"
        description="S.S. Global Public School, Daudnagar, Bihar is a premier CBSE institution offering interactive smart classrooms, science labs, sports, and holistic character building."
        keywords="S.S. Global Public School, Daudnagar, Bihar school, CBSE school Daudnagar, Best School in Daudnagar, Top School in Aurangabad Bihar, Admissions 2026"
        canonicalUrl="https://ssglobalpublicschool.com/"
        jsonLd={homeSchema}
      />
      <HeroSection />
      <WelcomeMessage />
      <AboutPreview />
      <WhyChooseUs />
      <StatsSection />
      <FacilitiesPreview />
      <GalleryPreview />
      <LatestNotices />
      <DownloadsPreview />
      <Testimonials />
      <CallToAction />
      <ContactPreview />
    </main>
  );
};

export default Home;
