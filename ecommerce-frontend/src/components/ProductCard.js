import React from 'react';
import { Link } from 'react-router-dom';
import './ProductCard.css';

// Card component for displaying a product in a grid with minimalist design.
function ProductCard({ product }) {
  const avgRating =
    product.reviews && product.reviews.length > 0
      ? product.reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / product.reviews.length
      : null;
  const pieceCount = product.pieceCount || product.pieces;

  return (
    <div className="col-md-4 col-sm-6 mb-4" role="listitem">
      <Link to={`/products/${product.id}`} className="text-decoration-none">
        <div className="product-card" role="article" aria-label={product.name}>
          {product.image && (
            <img src={product.image} alt={product.name} className="product-image" />
          )}
          <div className="product-info">
            <h5 className="product-name">{product.name}</h5>
            <div className="product-meta">
              {avgRating && (
                <span>
                  <span role="img" aria-label="rating">⭐</span>
                  {avgRating.toFixed(1)}
                </span>
              )}
              {pieceCount && (
                <span>
                  <span role="img" aria-label="pieces">🧱</span>
                  {pieceCount}
                </span>
              )}
            </div>
            <p className="product-price">${parseFloat(product.price).toFixed(2)}</p>
          </div>
        </div>
      </Link>
    </div>
  );
}

export default ProductCard;
