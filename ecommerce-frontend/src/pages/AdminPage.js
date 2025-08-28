import React from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/admin/AdminLayout';

// Simple placeholder for admin page. In a real application this would
// provide CRUD interfaces for products, categories, stock, etc.
function AdminPage() {
  return (
    <AdminLayout>
      <h2>Admin</h2>
      <p>
        Esta sección está en construcción. Aquí podrás gestionar productos,
        categorías, inventario y pedidos.
      </p>
      <div className="mt-4">
        <Link to="/admin/products/new" className="btn btn-primary">
          Agregar producto
        </Link>
      </div>
    </AdminLayout>
  );
}

export default AdminPage;
