import React from 'react';
import { Link } from 'react-router-dom';

// Simple home page welcoming users and linking to product catalog
function Home() {
  return (
    <div className="text-center">
      <h1 className="display-4 mb-3">Bienvenido a la tienda de Legos</h1>
      <p className="lead mb-4">
        Descubre nuestros sets de Lego y encuentra el ideal para ti. Desde ediciones
        clásicas hasta colecciones temáticas, tenemos todo para fans y familias.
      </p>
      <Link to="/products" className="btn btn-primary btn-lg">
        Ver productos
      </Link>
    </div>
  );
}

export default Home;