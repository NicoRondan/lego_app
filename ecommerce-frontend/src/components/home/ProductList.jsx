import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import SkeletonCard from './SkeletonCard';

function ProductList() {
  const [top, setTop] = useState([]);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const [t, n] = await Promise.all([
        api.getProducts({ limit: 8, order: 'sales_desc' }),
        api.getProducts({ limit: 8, order: 'createdAt_desc' }),
      ]);
      setTop(t.items || []);
      setNews(n.items || []);
      setLoading(false);
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="row g-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="col-6 col-md-3">
            <SkeletonCard />
          </div>
        ))}
      </div>
    );
  }

  return (
    <>
      <h2 className="mt-4">Más vendidos</h2>
      <div className="row g-3">
        {top.map((p) => (
          <div key={p.id} className="col-6 col-md-3">
            <div className="card h-100">
              <div className="bg-secondary" style={{ height: '150px' }} />
              <div className="card-body d-flex flex-column">
                <h6 className="card-title">{p.name}</h6>
                {p.price && (
                  <p className="fw-bold">${parseFloat(p.price).toFixed(2)}</p>
                )}
                <Link
                  to={`/products/${p.id}`}
                  className="btn btn-primary btn-sm mt-auto"
                >
                  Ver
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-5">Novedades</h2>
      <div className="row g-3">
        {news.map((p) => (
          <div key={p.id} className="col-6 col-md-3">
            <div className="card h-100">
              <div className="bg-secondary" style={{ height: '150px' }} />
              <div className="card-body d-flex flex-column">
                <h6 className="card-title">{p.name}</h6>
                {p.price && (
                  <p className="fw-bold">${parseFloat(p.price).toFixed(2)}</p>
                )}
                <Link
                  to={`/products/${p.id}`}
                  className="btn btn-primary btn-sm mt-auto"
                >
                  Ver
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default ProductList;
