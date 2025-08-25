import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import MiniCart from './MiniCart';
import BrickModal from './lego/BrickModal';

// Modal displaying current cart items with actions.
export default function CartModal() {
  const { cart } = useCart();
  const items = cart?.items || [];
  const total = items.reduce(
    (sum, it) => sum + it.quantity * parseFloat(it.unitPrice),
    0,
  );

  return (
    <BrickModal id="cartModal" title="Tu Carrito">
      {items.length ? (
        <>
          <MiniCart />
          <div className="mt-3 d-flex justify-content-between align-items-center">
            <Link to="/cart" className="btn btn-outline-primary">
              Ver carrito
            </Link>
            <span className="fw-bold">Total: ${total.toFixed(2)}</span>
          </div>
          <div className="mt-3 d-flex justify-content-end gap-2">
            <Link to="/checkout" className="btn btn-danger">
              Proceder al pago
            </Link>
            <button
              type="button"
              className="btn btn-outline-secondary"
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
