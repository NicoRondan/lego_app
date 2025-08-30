import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as api from '../../services/api';
import MultiItemCarousel from '../home/MultiItemCarousel';
import SkeletonCard from '../home/SkeletonCard';

function SectionRail({ title, query = {}, cta }) {
  const [items, setItems] = useState(null);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        // Map query
        const opts = { limit: 12 };
        if (query.theme) opts.theme = query.theme;
        if (query.isOnSale) opts.featured = '';
        if (query.sort) opts.order = query.sort;
        const resp = await api.getProducts(opts);
        if (mounted) setItems(resp.items || []);
      } catch {
        if (mounted) setItems([]);
      }
    }
    load();
    return () => { mounted = false; };
  }, [query.theme, query.isOnSale, query.sort]);

  const renderProduct = (p) => (
    <Link to={`/products/${p.id}`} className="text-decoration-none">
      <div className="image-frame" style={{ height: '150px' }}>
        {p.imageUrl ? (
          <img src={p.imageUrl} alt={p.name} loading="lazy" />
        ) : (
          <div className="bg-secondary w-100 h-100" />
        )}
      </div>
      <div className="mt-2 text-center">
        <h6 className="mb-1">{p.name}</h6>
        {p.price && <p className="fw-bold mb-0">${parseFloat(p.price).toFixed(2)}</p>}
      </div>
    </Link>
  );

  const renderSkeletons = () => (
    <div className="row g-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="col-12 col-md-6 col-lg-4">
          <SkeletonCard height={200} />
        </div>
      ))}
    </div>
  );

  return (
    <section className="my-4">
      {title && <h2 className="mb-3">{title}</h2>}
      {items === null ? (
        renderSkeletons()
      ) : (
        <MultiItemCarousel id={`rail-${title?.replace(/\s+/g,'-').toLowerCase()}`} items={items} renderItem={renderProduct} />
      )}
      {cta?.href && (
        <div className="mt-2 text-end">
          <Link to={cta.href} className="btn btn-outline-primary btn-sm">{cta.label || 'Ver más'}</Link>
        </div>
      )}
    </section>
  );
}

export default SectionRail;

