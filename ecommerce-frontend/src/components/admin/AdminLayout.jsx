import React from 'react';
import AdminSidebar from './AdminSidebar';

// Layout component providing an admin sidebar with links
function AdminLayout({ children }) {
  return (
    <div className="row g-0 align-items-start admin-layout-row">
      <div className="col-12 col-md-3 col-lg-2 pe-md-3 mb-3 mb-md-0">
        <AdminSidebar />
      </div>
      <div className="col admin-main">
        <div className="lego-container mt-0">{children}</div>
      </div>
    </div>
  );
}

export default AdminLayout;
