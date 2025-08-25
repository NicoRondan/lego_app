import React from 'react';
import { Link } from 'react-router-dom';
import BrickButton from './lego/BrickButton';

export default function Footer(){
  return (
    <footer className="bg-dark text-light mt-5" role="contentinfo">
      <div className="container py-5">
        <div className="lego-plate p-4 text-center rounded mb-4">
          <h2 className="mb-3">¿Listo para construir?</h2>
          <Link to="/products" className="text-decoration-none">
            <BrickButton className="btn-lg">Ver productos</BrickButton>
          </Link>
        </div>
        <div className="row">
          <div className="col-md-4 mb-4">
            <h5 className="text-warning">Información</h5>
            <ul className="list-unstyled mb-0">
              <li><Link to="/about" className="text-light text-decoration-none">Nosotros</Link></li>
              <li><Link to="/policies" className="text-light text-decoration-none">Políticas</Link></li>
            </ul>
          </div>
          <div className="col-md-4 mb-4">
            <h5 className="text-warning">Ayuda</h5>
            <ul className="list-unstyled mb-0">
              <li><Link to="/contact" className="text-light text-decoration-none">Contacto</Link></li>
              <li><Link to="/faq" className="text-light text-decoration-none">Preguntas frecuentes</Link></li>
            </ul>
          </div>
          <div className="col-md-4 mb-4">
            <h5 className="text-warning">Redes Sociales</h5>
            <div className="footer-social">
              <a href="https://facebook.com" className="me-3" aria-label="Facebook">
                <i className="fab fa-facebook-f" aria-hidden="true"></i>
              </a>
              <a href="https://instagram.com" className="me-3" aria-label="Instagram">
                <i className="fab fa-instagram" aria-hidden="true"></i>
              </a>
              <a href="https://twitter.com" aria-label="Twitter">
                <i className="fab fa-twitter" aria-hidden="true"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="text-center mt-4 small">
          Brick Market – inspirado en LEGO
        </div>
      </div>
    </footer>
  );
}
