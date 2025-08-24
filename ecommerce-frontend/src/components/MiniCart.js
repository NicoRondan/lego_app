import React from 'react';

// Mini cart dropdown listing selected items
function MiniCart({ items = [] }) {
  if (!items.length) {
    return <div className="p-3 text-center" role="menuitem">Carrito vacío</div>;
  }
  return (
    <ul className="list-unstyled m-0" role="menu" aria-label="Mini carrito">
      {items.map((item) => (
        <li key={item.id} className="dropdown-item d-flex justify-content-between" role="menuitem">
          <span>{item.product?.name} x{item.quantity}</span>
          <span>${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
}

export default MiniCart;
