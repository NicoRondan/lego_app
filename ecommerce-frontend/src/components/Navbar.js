import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartModal from './CartModal';
import ThemeToggle from './ThemeToggle';

// Navigation bar component. Uses Bootstrap classes for styling.
function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  return (
    <>
    <nav className="navbar navbar-expand-lg navbar-light border-bottom">
      <div className="container-fluid">
        <Link className="navbar-brand d-flex align-items-center" to="/" aria-label="Inicio">
          <img
            src="/assets/logo.png"
            alt="Brick Market"
            width="48"
            height="48"
            className="d-inline-block align-text-top me-2"
          />
          <span className="fw-bold">Brick Market</span>
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/products">
                Productos
              </Link>
            </li>
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/orders">
                  Mis pedidos
                </Link>
              </li>
            )}
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/wishlist">
                  Mi wishlist
                </Link>
              </li>
            )}
            {user && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            <li className="nav-item">
              <button
                className="nav-link btn btn-link d-flex align-items-center"
                type="button"
                data-bs-toggle="modal"
                data-bs-target="#cartModal"
              >
                <i className="fa-solid fa-cart-shopping me-1" aria-hidden="true"></i>
                <span>Carrito</span>
              </button>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">
                    <i className="fa-solid fa-user me-1" aria-hidden="true"></i>
                    Hola, {user.name}
                  </span>
                </li>
                <li className="nav-item">
                  <button onClick={logout} className="btn btn-link nav-link">
                    <i className="fa-solid fa-right-from-bracket me-1" aria-hidden="true"></i>
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center" to="/login">
                  <i className="fa-solid fa-right-to-bracket me-1" aria-hidden="true"></i>
                  <span>Iniciar sesión</span>
                </Link>
              </li>
            )}
            <li className="nav-item ms-2">
              <ThemeToggle />
            </li>
          </ul>
        </div>
      </div>
    </nav>
    <CartModal items={cart?.items || []} />
    </>
  );
}

export default Navbar;
