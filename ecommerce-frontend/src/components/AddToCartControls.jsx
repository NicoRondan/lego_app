import React, { useState } from 'react';
import QuantityStepper from './QuantityStepper';
import BrickButton from './lego/BrickButton';
import { useCart } from '../contexts/CartContext';
import { toast } from 'react-toastify';

export default function AddToCartControls({ product, className = '' }) {
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(false);
  const { cart, addItem } = useCart();

  const productId = product?.id;
  const added = cart?.items?.some((it) => it.product?.id === productId || it.productId === productId);

  const handleAdd = async (e) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!productId) return;
    try {
      setLoading(true);
      await addItem({ productId, quantity: qty });
      toast.success('Agregado');
      setQty(1);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`d-flex align-items-center gap-2 ${className}`} onClick={(e) => e.stopPropagation()}>
      <div style={{ width: 160 }}>
        <QuantityStepper
          value={qty}
          onChange={setQty}
          min={1}
          max={product?.stock}
        />
      </div>
      <BrickButton
        color={added ? 'green' : 'yellow'}
        onClick={handleAdd}
        disabled={added || loading}
        className="flex-grow-1 d-flex align-items-center justify-content-center"
      >
        <i className={`fa-solid ${added ? 'fa-check' : 'fa-cart-plus'} me-1`} aria-hidden="true"></i>
        {added ? 'Añadido' : 'Agregar'}
      </BrickButton>
    </div>
  );
}

