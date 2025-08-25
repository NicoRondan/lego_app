import React from 'react';
import { Link } from 'react-router-dom';
import BrickButton from './lego/BrickButton';

export default function Footer(){
  return (
    <footer className="lego-plate tex py-5 mt-5">
      <div className="container text-center">
        <h2 className="mb-3">¿Listo para construir?</h2>
        <Link to="/products" className="text-decoration-none">
          <BrickButton className="btn-lg">Ver productos</BrickButton>
        </Link>
      </div>
    </footer>
  );
}
