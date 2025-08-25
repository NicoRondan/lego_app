import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PromoStrip from '../components/home/PromoStrip';
import Hero from '../components/home/Hero';
import LegoProductRail from '../components/home/LegoProductRail';
import CategoryCarousel from '../components/home/CategoryCarousel';
import BenefitsBar from '../components/home/BenefitsBar';
import ReviewsCarousel from '../components/home/ReviewsCarousel';
import Newsletter from '../components/home/Newsletter';
import TrustBadges from '../components/home/TrustBadges';
import * as api from '../services/api';

function Home() {
  const [featured, setFeatured] = useState(null);
  const [top, setTop] = useState(null);
  const [news, setNews] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, t, n] = await Promise.all([
          api.getProducts({ featured: true, limit: 12 }),
          api.getProducts({ order: 'sales_desc', limit: 12 }),
          api.getProducts({ order: 'createdAt_desc', limit: 12 }),
        ]);
        setFeatured(f.items || []);
        setTop(t.items || []);
        setNews(n.items || []);
      } catch {
        setFeatured([]);
        setTop([]);
        setNews([]);
      }
    };
    load();
  }, []);

  const renderProduct = (p) => (
    <div className="card h-100">
      {p.imageUrl ? (
        <img
          src={p.imageUrl}
          alt={p.name}
          className="card-img-top"
          style={{ height: '150px', objectFit: 'cover' }}
          loading="lazy"
        />
      ) : (
        <div className="card-img-top bg-secondary" style={{ height: '150px' }} />
      )}
      <div className="card-body d-flex flex-column">
        <h6 className="card-title">{p.name}</h6>
        {p.price && <p className="fw-bold">${parseFloat(p.price).toFixed(2)}</p>}
        <Link to={`/products/${p.id}`} className="btn btn-primary btn-sm mt-auto">
          Ver
        </Link>
      </div>
    </div>
  );

  return (
    <div>
      <PromoStrip />
      <Hero
        title="Bienvenido a Brick Market"
        subtitle="Descubre sets increíbles y coleccionables"
      />
      <div className="container my-5">
        <LegoProductRail
          title="Destacados"
          items={featured}
          renderItem={renderProduct}
          ctaText="Ver todos"
          ctaHref="/products"
          id="featured-rail"
          perView={3}
          skeletonCount={3}
        />
        <h2 className="mt-5 mb-4">Categorías</h2>
        <CategoryCarousel />
        <LegoProductRail
          title="Más vendidos"
          items={top}
          renderItem={renderProduct}
          ctaText="Ver todos"
          ctaHref="/products"
          id="top-rail"
          perView={3}
          skeletonCount={3}
        />
        <LegoProductRail
          title="Novedades"
          items={news}
          renderItem={renderProduct}
          ctaText="Ver todos"
          ctaHref="/products"
          id="new-rail"
          perView={3}
          skeletonCount={3}
        />
        <BenefitsBar />
        <h2 className="mt-5 mb-4">Reseñas</h2>
        <ReviewsCarousel />
        <div className="my-5">
          <Newsletter />
        </div>
        <TrustBadges />
      </div>
    </div>
  );
}

export default Home;
