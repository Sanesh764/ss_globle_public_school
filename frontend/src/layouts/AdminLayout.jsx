import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/admin/AdminSidebar';
import SEO from '../components/common/SEO';

const AdminLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F4EFE3] text-[#252821] flex">
      <SEO
        title="Admin Portal | S.S. Global Public School"
        description="Administrative portal for S.S. Global Public School."
        noindex={true}
      />
      <AdminSidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Outlet context={{ setMobileOpen }} />
      </div>
    </div>
  );
};

export default AdminLayout;
