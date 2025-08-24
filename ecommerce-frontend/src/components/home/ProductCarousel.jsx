import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SkeletonCard from './SkeletonCard';

function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch('/products?featured=true&limit=10')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .catch(() =>
        fetch('/products?limit=10&sort=popularity').then((r) =>
          r.ok ? r.json() : Promise.reject()
        )
      )
      .then((data) => setProducts(data || []))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex gap-3 overflow-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center">
        <p>No se pudieron cargar los productos destacados.</p>
        <Link to="/products" className="btn btn-primary">
          Ver todos
        </Link>
      </div>
    );
  }

  return (
    <div id="featuredCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {products.map((p, idx) => (
          <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={p.id}>
            {p.image ? (
              <img
                src={p.image}
                className="d-block w-100"
                alt={p.name}
                loading="lazy"
              />
            ) : (
              <div className="bg-secondary" style={{ height: '300px' }} />
            )}
            <div className="carousel-caption d-none d-md-block">
              <h5>{p.name}</h5>
              {p.price && <p>${parseFloat(p.price).toFixed(2)}</p>}
              <Link to={`/products/${p.id}`} className="btn btn-primary btn-sm">
                Ver
              </Link>
            </div>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#featuredCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#featuredCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true"></span>
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default ProductCarousel;
