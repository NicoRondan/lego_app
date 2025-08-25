import React from 'react';
import { useCart } from '../contexts/CartContext';

// Mini cart dropdown listing selected items
function MiniCart() {
  const { cart } = useCart();
  const items = cart?.items || [];

  if (!items.length) {
    return <div className="p-3 text-center" role="menuitem">Carrito vacío</div>;
  }

  return (
    <ul className="list-unstyled m-0" role="menu" aria-label="Mini carrito">
      {items.map((item) => (
        <li
          key={item.id}
          className="dropdown-item d-flex align-items-center gap-2"
          role="menuitem"
        >
          <img
            src={item.product?.image}
            alt={item.product?.name}
            width="40"
            height="40"
            className="flex-shrink-0"
            style={{ objectFit: 'cover' }}
          />
          <div className="flex-grow-1">
            <div>{item.product?.name}</div>
            <div className="small text-muted">
              ${parseFloat(item.unitPrice).toFixed(2)} c/u
            </div>
          </div>
          <div className="text-end">
            <div>x{item.quantity}</div>
            <div>
              ${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default MiniCart;
