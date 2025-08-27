import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

// Mini cart dropdown listing selected items
function MiniCart() {
  const { cart } = useCart();
  const items = cart?.items || [];
  const itemsCount = cart?.summary?.itemsCount || 0;

  if (!itemsCount) {
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
          <Link
            to={`/products/${item.productId}`}
            className="d-flex align-items-center gap-2 flex-grow-1 text-decoration-none text-body"
          >
            <img
              src={item.thumbnailUrl || 'https://via.placeholder.com/64'}
              alt={item.displayName || 'Producto'}
              width="64"
              height="64"
              className="flex-shrink-0 rounded"
              style={{ objectFit: 'cover' }}
            />
            <div className="flex-grow-1">
              <div>{item.displayName || item.name}</div>
              <div className="small text-muted">
                ${parseFloat(item.unitPrice).toFixed(2)} c/u
              </div>
            </div>
          </Link>
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
