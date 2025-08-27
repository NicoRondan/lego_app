import React from 'react';
import AdminSidebar from './AdminSidebar';

// Layout component providing an admin sidebar with links
function AdminLayout({ children }) {
  return (
    <div className="row">
      <div className="col-12 col-md-3 col-lg-2 mb-4 mb-md-0">
        <AdminSidebar />
      </div>
      <div className="col">{children}</div>
    </div>
  );
}

export default AdminLayout;
