import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import CartModal from './CartModal';
import ThemeToggle from './ThemeToggle';
// import * as api from '../services/api'; // no longer needed after WishlistContext
import { useWishlist } from '../contexts/WishlistContext.jsx';

// Navigation bar component. Uses Bootstrap classes for styling.
function Navbar() {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const itemsCount = cart?.summary?.itemsCount || 0;
  const { count: wishlistCount, pulse: wishlistPulse } = useWishlist();
  const allowGuestCart = process.env.REACT_APP_ALLOW_GUEST_CART === 'true';
  const isAdmin = useMemo(() => {
    const ADMIN_ROLES = ['superadmin','catalog_manager','oms','support','marketing'];
    return user?.role === 'admin' || ADMIN_ROLES.includes(user?.role);
  }, [user]);
  const isImpersonating = typeof document !== 'undefined' && /(?:^|; )impersonation=1/.test(document.cookie || '');
  return (
    <>
    {isImpersonating && (
      <div className="bg-warning text-dark text-center py-1">
        Impersonando a un cliente – <button className="btn btn-link p-0" onClick={logout}>Salir</button>
      </div>
    )}
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
            {user?.role === 'customer' && (
              <li className="nav-item">
                <Link className="nav-link" to="/orders">
                  Mis pedidos
                </Link>
              </li>
            )}
            {user?.role === 'customer' && (
              <li className="nav-item">
                <Link className="nav-link d-flex align-items-center" to="/wishlist">
                  <span className="position-relative me-1">
                    <i className="fa-regular fa-heart" aria-hidden="true"></i>
                    {wishlistCount > 0 && (
                      <span className={`position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger ${wishlistPulse ? 'badge-pulse' : ''}`}>
                        {wishlistCount}
                        <span className="visually-hidden">items in wishlist</span>
                      </span>
                    )}
                  </span>
                  <span>Wishlist</span>
                </Link>
              </li>
            )}
            {isAdmin && (
              <li className="nav-item">
                <Link className="nav-link" to="/admin">
                  Admin
                </Link>
              </li>
            )}
          </ul>
          <ul className="navbar-nav ms-auto">
            {((user?.role === 'customer') || (!user && allowGuestCart)) && (
              <li className="nav-item">
                <button
                  className="nav-link btn btn-link d-flex align-items-center"
                  type="button"
                  data-bs-toggle="modal"
                  data-bs-target="#cartModal"
                  disabled={!!user && user.role !== 'customer'}
                >
                  <span className="position-relative me-1">
                    <i className="fa-solid fa-cart-shopping" aria-hidden="true"></i>
                    {itemsCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                        {itemsCount}
                        <span className="visually-hidden">items in cart</span>
                      </span>
                    )}
                  </span>
                  <span>Carrito</span>
                </button>
              </li>
            )}
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
    {((user?.role === 'customer') || (!user && allowGuestCart)) && <CartModal />}
    </>
  );
}

export default Navbar;
