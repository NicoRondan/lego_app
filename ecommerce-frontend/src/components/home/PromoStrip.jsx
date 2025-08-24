import React from 'react';

function PromoStrip({ message = 'Usa el cupón BRICK10 y obten 10% de descuento' }) {
  return <div className="bg-warning text-dark text-center py-2">{message}</div>;
}

export default PromoStrip;
