import React from 'react';
import { Navigate, Outlet, useOutletContext } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingSpinner from '../components/common/LoadingSpinner';

/**
 * Route component that restricts access to Super Admin users only.
 * It also normalizes the role string to handle variations such as "SUPERADMIN", "super_admin", etc.
 */
const SuperAdminRoute = () => {
  const { loading, admin, role } = useAuth();
  const outletContext = useOutletContext();

  if (loading) {
    return <LoadingSpinner fullScreen text="Verifying Administrator Authorization..." />;
  }

  // Normalized role for robust comparison
  const normalizedRole = (role || admin?.role || '')
    .toString()
    .toLowerCase()
    .replace(/_/g, '');

  // Only allow superadmin/admin access
  if (normalizedRole !== 'superadmin' && normalizedRole !== 'admin') {
    return <Navigate to="/unauthorized" replace />;
  }
  return <Outlet context={outletContext} />;
};

export default SuperAdminRoute;
