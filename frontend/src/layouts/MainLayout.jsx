import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const MainLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F4EFE3] text-[#252821] overflow-x-hidden w-full max-w-full">
      <Navbar />
      <div className="flex-1 w-full max-w-full overflow-x-hidden">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
};

export default MainLayout;
