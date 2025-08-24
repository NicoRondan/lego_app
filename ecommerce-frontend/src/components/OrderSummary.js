import React from 'react';

// Displays order totals with tax and discounts
function OrderSummary({ subtotal = 0, tax = 0, discount = 0 }) {
  const total = subtotal + tax - discount;
  return (
    <div role="region" aria-label="Resumen de la orden">
      <div className="d-flex justify-content-between">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span>Impuestos</span>
        <span>${tax.toFixed(2)}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span>Descuento</span>
        <span>${discount.toFixed(2)}</span>
      </div>
      <hr />
      <div className="d-flex justify-content-between fw-bold" aria-label="Total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
    </div>
  );
}

export default OrderSummary;
