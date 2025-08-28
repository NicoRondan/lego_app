import React from 'react';
import { NavLink } from 'react-router-dom';
import './AdminSidebar.css';

// Sidebar navigation for admin pages
function AdminSidebar() {
  return (
    <aside className="admin-sidebar lego-container d-flex flex-column p-3">
      <h2 className="mb-4">Admin</h2>
      <nav className="nav nav-pills flex-column">
        <NavLink
          end
          to="/admin"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Dashboard
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
        >
          Pedidos
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
