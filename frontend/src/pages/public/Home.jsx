import React from 'react';
import HeroSection from '../../components/home/HeroSection';
import WelcomeMessage from '../../components/home/WelcomeMessage';
import AboutPreview from '../../components/home/AboutPreview';
import WhyChooseUs from '../../components/home/WhyChooseUs';
import StatsSection from '../../components/home/StatsSection';
import FacilitiesPreview from '../../components/home/FacilitiesPreview';
import GalleryPreview from '../../components/home/GalleryPreview';
import LatestNotices from '../../components/home/LatestNotices';
import Testimonials from '../../components/home/Testimonials';
import CallToAction from '../../components/home/CallToAction';
import ContactPreview from '../../components/home/ContactPreview';

const Home = () => {
  return (
    <div className="space-y-0">
      <HeroSection />
      <WelcomeMessage />
      <AboutPreview />
      <WhyChooseUs />
      <StatsSection />
      <FacilitiesPreview />
      <GalleryPreview />
      <LatestNotices />
      <Testimonials />
      <CallToAction />
      <ContactPreview />
    </div>
  );
};

export default Home;
