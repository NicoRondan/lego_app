import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import MiniCart from './MiniCart';
import * as api from '../services/api';

// Navigation bar component. Uses Bootstrap classes for styling.
function Navbar() {
  const { user, logout } = useAuth();
  const [cart, setCart] = useState(null);

  useEffect(() => {
    const loadCart = async () => {
      if (!user) return setCart(null);
      try {
        const data = await api.getCart();
        setCart(data);
      } catch (err) {
        console.error(err);
      }
    };
    loadCart();
  }, [user]);
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <Link className="navbar-brand" to="/" aria-label="Inicio">
          <img
            src="/assets/logo.png"
            alt="Brick Market"
            width="48"
            height="48"
            className="d-inline-block align-text-top"
          />
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
            <li className="nav-item dropdown">
              <Link
                className="nav-link dropdown-toggle"
                to="/cart"
                id="miniCartDropdown"
                role="button"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                Carrito
              </Link>
              <div className="dropdown-menu dropdown-menu-end" aria-labelledby="miniCartDropdown">
                <MiniCart items={cart?.items || []} />
              </div>
            </li>
            {user ? (
              <>
                <li className="nav-item">
                  <span className="nav-link">Hola, {user.name}</span>
                </li>
                <li className="nav-item">
                  <button onClick={logout} className="btn btn-link nav-link">
                    Salir
                  </button>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">
                  Iniciar sesión
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
