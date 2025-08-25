import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import MiniCart from './MiniCart';
import BrickModal from './lego/BrickModal';

// Modal displaying current cart items with actions.
export default function CartModal() {
  const navigate = useNavigate();
  const { cart } = useCart();
  const items = cart?.items || [];
  const itemsCount = cart?.summary?.itemsCount || 0;
  const total = items.reduce(
    (sum, it) => sum + it.quantity * parseFloat(it.unitPrice),
    0,
  );

  const closeAndNavigate = (path) => {
    const modalEl = document.getElementById('cartModal');
    if (modalEl && window.bootstrap?.Modal) {
      const instance = window.bootstrap.Modal.getInstance(modalEl) ||
        new window.bootstrap.Modal(modalEl);
      instance.hide();
    }
    navigate(path);
  };

  return (
    <BrickModal id="cartModal" title="Tu Carrito">
      {itemsCount ? (
        <>
          <MiniCart />
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => closeAndNavigate('/cart')}
            >
              Ver carrito
            </button>
            <span className="fw-bold">Total: ${total.toFixed(2)}</span>
          </div>
          <div className="mt-3 d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => closeAndNavigate('/checkout')}
            >
              Proceder al pago
            </button>
            <button
              type="button"
              className="btn btn-warning"
              data-bs-dismiss="modal"
            >
              Seguir comprando
            </button>
          </div>
        </>
      ) : (
        <p className="mb-0">Carrito vacío</p>
      )}
    </BrickModal>
  );
}
