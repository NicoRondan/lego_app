import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PromoStrip from '../components/home/PromoStrip';
import Hero from '../components/home/Hero';
import BenefitsBar from '../components/home/BenefitsBar';
import MultiItemCarousel from '../components/home/MultiItemCarousel';
import CategoryCarousel from '../components/home/CategoryCarousel';
import ReviewsCarousel from '../components/home/ReviewsCarousel';
import Newsletter from '../components/home/Newsletter';
import TrustBadges from '../components/home/TrustBadges';
import * as api from '../services/api';
import SkeletonCard from '../components/home/SkeletonCard';

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
    <div>
      <PromoStrip />
      <Hero
        title="Bienvenido a Brick Market"
        subtitle="Descubre sets increíbles y coleccionables"
      />
      <BenefitsBar />
      <div className="container my-5">
        <h2 className="mb-4">Destacados</h2>
        {featured === null ? (
          renderSkeletons()
        ) : (
          <MultiItemCarousel id="featuredCarousel" items={featured} renderItem={renderProduct} auto />
        )}
        <h2 className="mt-5 mb-4">Categorías</h2>
        <CategoryCarousel />
        <h2 className="mt-5 mb-4">Más vendidos</h2>
        {top === null ? (
          renderSkeletons()
        ) : (
          <MultiItemCarousel id="topCarousel" items={top} renderItem={renderProduct} />
        )}
        <h2 className="mt-5 mb-4">Novedades</h2>
        {news === null ? (
          renderSkeletons()
        ) : (
          <MultiItemCarousel id="newCarousel" items={news} renderItem={renderProduct} />
        )}
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

