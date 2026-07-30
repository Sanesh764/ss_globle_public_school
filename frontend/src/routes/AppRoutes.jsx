import React, { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';

import MainLayout from '../layouts/MainLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from './ProtectedRoute';
import SuperAdminRoute from './SuperAdminRoute';
import LoadingSpinner from '../components/common/LoadingSpinner';

// Lazy Loaded Public Pages for Performance
const Home = lazy(() => import('../pages/public/Home'));
const About = lazy(() => import('../pages/public/About'));
const Facilities = lazy(() => import('../pages/public/Facilities'));
const Gallery = lazy(() => import('../pages/public/Gallery'));
const NoticeBoard = lazy(() => import('../pages/public/NoticeBoard'));
const Downloads = lazy(() => import('../pages/public/Downloads'));
const Contact = lazy(() => import('../pages/public/Contact'));
const NotFound = lazy(() => import('../pages/public/NotFound'));
const Unauthorized = lazy(() => import('../pages/public/Unauthorized'));

// Lazy Loaded Admin Pages
const AdminLogin = lazy(() => import('../pages/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminAbout = lazy(() => import('../pages/admin/AdminAbout'));
const AdminNotices = lazy(() => import('../pages/admin/AdminNotices'));
const AdminGallery = lazy(() => import('../pages/admin/AdminGallery'));
const AdminFacilities = lazy(() => import('../pages/admin/AdminFacilities'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('../pages/admin/AdminSettings'));
const AdminMessages = lazy(() => import('../pages/admin/AdminMessages'));
const AdminLeadership = lazy(() => import('../pages/admin/AdminLeadership'));
const AdminHeroSlider = lazy(() => import('../pages/admin/AdminHeroSlider'));
const AdminAcademicResources = lazy(() => import('../pages/admin/AdminAcademicResources'));
const AdminProfile = lazy(() => import('../pages/admin/AdminProfile'));

const SuspenseWrapper = ({ children }) => (
  <Suspense fallback={<LoadingSpinner fullScreen text="Loading Page..." />}>
    {children}
  </Suspense>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages Layout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<SuspenseWrapper><Home /></SuspenseWrapper>} />
        <Route path="about" element={<SuspenseWrapper><About /></SuspenseWrapper>} />
        <Route path="facilities" element={<SuspenseWrapper><Facilities /></SuspenseWrapper>} />
        <Route path="gallery" element={<SuspenseWrapper><Gallery /></SuspenseWrapper>} />
        <Route path="notices" element={<SuspenseWrapper><NoticeBoard /></SuspenseWrapper>} />
        <Route path="downloads" element={<SuspenseWrapper><Downloads /></SuspenseWrapper>} />
        <Route path="contact" element={<SuspenseWrapper><Contact /></SuspenseWrapper>} />
        <Route path="unauthorized" element={<SuspenseWrapper><Unauthorized /></SuspenseWrapper>} />
        <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
      </Route>

      {/* Admin Login (Unprotected) */}
      <Route path="/admin/login" element={<SuspenseWrapper><AdminLogin /></SuspenseWrapper>} />

      {/* Protected Admin Dashboard Layout (Super Admin & Staff Admin) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
          <Route path="dashboard" element={<SuspenseWrapper><AdminDashboard /></SuspenseWrapper>} />
          <Route path="notices" element={<SuspenseWrapper><AdminNotices /></SuspenseWrapper>} />
          <Route path="gallery" element={<SuspenseWrapper><AdminGallery /></SuspenseWrapper>} />
          <Route path="messages" element={<SuspenseWrapper><AdminMessages /></SuspenseWrapper>} />
          <Route path="academic-resources" element={<SuspenseWrapper><AdminAcademicResources /></SuspenseWrapper>} />

          {/* Super Admin Restricted Routes (Staff Admin gets 403 / Unauthorized if manually typed) */}
          <Route element={<SuperAdminRoute />}>
            <Route path="profile" element={<SuspenseWrapper><AdminProfile /></SuspenseWrapper>} />
            <Route path="hero-slider" element={<SuspenseWrapper><AdminHeroSlider /></SuspenseWrapper>} />
            <Route path="about" element={<SuspenseWrapper><AdminAbout /></SuspenseWrapper>} />
            <Route path="leadership" element={<SuspenseWrapper><AdminLeadership /></SuspenseWrapper>} />
            <Route path="facilities" element={<SuspenseWrapper><AdminFacilities /></SuspenseWrapper>} />
            <Route path="settings" element={<SuspenseWrapper><AdminSettings /></SuspenseWrapper>} />
            <Route path="users" element={<SuspenseWrapper><AdminUsers /></SuspenseWrapper>} />
          </Route>

          {/* Unknown Admin Sub-routes render 404 */}
          <Route path="*" element={<SuspenseWrapper><NotFound /></SuspenseWrapper>} />
        </Route>
      </Route>
    </Routes>
  );
};

export default AppRoutes;
