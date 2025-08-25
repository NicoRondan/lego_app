import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import BrickButton from './lego/BrickButton';
import * as api from '../services/api';

// Card component for displaying a product in a grid. Uses Bootstrap classes.
function ProductCard({ product }) {
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    try {
      setLoading(true);
      await api.addToCart({ productId: product.id, quantity: 1 });
      setAdded(true);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="col-md-4 col-sm-6 mb-4" role="listitem">
      <div className="card h-100 brick-card" role="article" aria-label={product.name}>
        {/* Placeholder for product image: in a real app you'd load from product.images */}
        <div className="card-img-top bg-secondary" style={{ height: '180px' }}></div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text flex-grow-1">
            {product.description?.substring(0, 80)}
            {product.description && product.description.length > 80 ? '…' : ''}
          </p>
          <p className="card-text fw-bold">${parseFloat(product.price).toFixed(2)}</p>
          <div className="mt-auto">
            <BrickButton
              className="w-100 mb-2"
              color={added ? 'green' : 'yellow'}
              onClick={handleAddToCart}
              disabled={loading}
            >
              {added ? '✔ Añadido' : loading ? 'Añadiendo…' : 'Añadir al carrito'}
            </BrickButton>
            <Link to={`/products/${product.id}`} className="text-decoration-none">
              <BrickButton className="w-100">Ver</BrickButton>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
