import React from 'react';
import SEO from '../../components/common/SEO';
import IndependenceDayTicker from '../../components/home/IndependenceDayTicker';
import HeroSection from '../../components/home/HeroSection';
import StudentRegistrationSection from '../../components/home/StudentRegistrationSection';
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
import { getSchoolSchema } from '../../utils/seoSchema';
import { PUBLIC_ROUTE_SEO } from '../../utils/seoRoutesConfig';

const Home = () => {
  const homeSchema = getSchoolSchema();
  const seoMeta = PUBLIC_ROUTE_SEO['/'];

  return (
    <main className="space-y-0">
      <SEO
        title={seoMeta.title}
        description={seoMeta.description}
        canonicalUrl={seoMeta.canonicalUrl}
        ogImage={seoMeta.ogImage}
        jsonLd={homeSchema}
      />
      <IndependenceDayTicker />
      <HeroSection />
      <StudentRegistrationSection />
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
