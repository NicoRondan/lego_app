import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import SkeletonCard from './SkeletonCard';

function ProductCarousel() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        let data = await api.getProducts({ featured: true, limit: 10 });
        if (!data.items || data.items.length === 0) {
          data = await api.getProducts({ limit: 10, order: 'popularity_desc' });
        }
        setProducts(data.items || []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
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
            {p.imageUrl ? (
              <div className="image-frame" style={{ height: '400px' }}>
                <img src={p.imageUrl} alt={p.name} loading="lazy" />
              </div>
            ) : (
              <div className="image-frame bg-secondary" style={{ height: '300px' }} />
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
