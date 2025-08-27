import React from 'react';
import { Link } from 'react-router-dom';

// Simple placeholder for admin page. In a real application this would
// provide CRUD interfaces for products, categories, stock, etc.
function AdminPage() {
  return (
    <div>
      <h2>Panel de administración</h2>
      <p>
        Esta sección está en construcción. Aquí podrás gestionar productos,
        categorías, inventario y pedidos.
      </p>
      <div className="mt-4">
        <Link to="/admin/products/new" className="btn btn-primary">
          Agregar producto
        </Link>
      </div>
    </div>
  );
}

export default AdminPage;