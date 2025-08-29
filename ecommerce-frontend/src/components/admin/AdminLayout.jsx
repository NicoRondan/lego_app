import React from 'react';
import AdminSidebar from './AdminSidebar';

// Layout component providing an admin sidebar with links
function AdminLayout({ children }) {
  return (
    <div className="row gx-3">
      <div className="col-12 col-md-3 col-lg-2">
        <AdminSidebar />
      </div>
      <div className="col">
        <div className="lego-container">{children}</div>
      </div>
    </div>
  );
}

export default AdminLayout;
