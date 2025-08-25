import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import MiniCart from './MiniCart';
import BrickModal from './lego/BrickModal';

// Modal displaying current cart items with actions.
export default function CartModal() {
  const { cart } = useCart();
  const items = cart?.items || [];
  return (
    <BrickModal id="cartModal" title="Tu Carrito">
      {items.length ? (
        <>
          <MiniCart items={items} />
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
