import React from 'react';
import { Link } from 'react-router-dom';
import BrickButton from './lego/BrickButton';

export default function Footer(){
  return (
    <footer className="bg-dark text-light py-5 mt-5" role="contentinfo">
      <div className="container">
        <div className="lego-plate tex p-4 text-center rounded">
          <h2 className="mb-3">¿Listo para construir?</h2>
          <Link to="/products" className="text-decoration-none">
            <BrickButton className="btn-lg">Ver productos</BrickButton>
          </Link>
        </div>
      </div>
    </footer>
  );
}
