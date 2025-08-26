import React, { useEffect, useState } from 'react';

function PromoStrip({ message = 'Usa el cupón BRICK10 y obten 10% de descuento' }) {
  const [visible, setVisible] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('promoStripClosed') !== 'true';
    }
    return true;
  });

  useEffect(() => {
    if (!visible) {
      localStorage.setItem('promoStripClosed', 'true');
    }
  }, [visible]);

  const handleClose = () => {
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="bg-warning text-dark text-center py-2 position-relative">
      {message}
      <button
        type="button"
        className="btn-close position-absolute top-0 end-0 m-2"
        aria-label="Cerrar promoción"
        onClick={handleClose}
      ></button>
    </div>
  );
}

export default PromoStrip;
