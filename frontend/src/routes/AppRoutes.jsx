import React from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';

// Public Pages
import Home from '../pages/public/Home';
import About from '../pages/public/About';
import Facilities from '../pages/public/Facilities';
import Gallery from '../pages/public/Gallery';
import NoticeBoard from '../pages/public/NoticeBoard';
import Contact from '../pages/public/Contact';
import NotFound from '../pages/public/NotFound';

// Admin Pages
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminNotices from '../pages/admin/AdminNotices';
import AdminGallery from '../pages/admin/AdminGallery';
import AdminSettings from '../pages/admin/AdminSettings';
import AdminMessages from '../pages/admin/AdminMessages';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="facilities" element={<Facilities />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="notices" element={<NoticeBoard />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Admin Login (Unprotected) */}
      <Route path="/admin/login" element={<AdminLogin />} />

      {/* Protected Admin Dashboard Layout */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="notices" element={<AdminNotices />} />
          <Route path="gallery" element={<AdminGallery />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="messages" element={<AdminMessages />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
