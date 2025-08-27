import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

// Sidebar navigation for admin pages with LEGO-styled logo
function AdminSidebar() {
  return (
    <aside className="admin-sidebar d-flex flex-column p-3">
      <div className="lego-logo mb-4 text-center">LEGO</div>
      <nav className="nav nav-pills flex-column">
        <NavLink
          end
          to="/admin"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/products/new"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Agregar producto
        </NavLink>
      </nav>
    </aside>
  );
}

export default AdminSidebar;
