import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ProtectedRoute = () => {
  const { isAuthenticated, loading, admin } = useAuth();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying Administrator Authorization..." />;
  }

  if (!isAuthenticated || !admin) {
    return <Navigate to="/admin/login" replace />;
  }

  // Allow any authenticated admin (superadmin, admin, or staff)
  const userRole = (admin?.role || '').toString().toLowerCase().replace(/_/g, '');
  if (!['superadmin', 'admin', 'staff'].includes(userRole)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
