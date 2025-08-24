import React from 'react';
import { Link } from 'react-router-dom';

// Card component for displaying a product in a grid. Uses Bootstrap classes.
function ProductCard({ product }) {
  return (
    <div className="col-md-4 col-sm-6 mb-4" role="listitem">
      <div className="card h-100" role="article" aria-label={product.name}>
        {/* Placeholder for product image: in a real app you'd load from product.images */}
        <div className="card-img-top bg-secondary" style={{ height: '180px' }}></div>
        <div className="card-body d-flex flex-column">
          <h5 className="card-title">{product.name}</h5>
          <p className="card-text flex-grow-1">
            {product.description?.substring(0, 80)}
            {product.description && product.description.length > 80 ? '…' : ''}
          </p>
          <p className="card-text fw-bold">${parseFloat(product.price).toFixed(2)}</p>
          <Link to={`/products/${product.id}`} className="btn btn-primary mt-auto">
            Ver
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;