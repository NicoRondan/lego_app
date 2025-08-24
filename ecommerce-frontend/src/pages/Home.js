import React from 'react';
import PromoStrip from '../components/home/PromoStrip';
import Hero from '../components/home/Hero';
import ProductCarousel from '../components/home/ProductCarousel';
import CategoryCarousel from '../components/home/CategoryCarousel';
import ProductList from '../components/home/ProductList';
import BenefitsBar from '../components/home/BenefitsBar';
import ReviewsCarousel from '../components/home/ReviewsCarousel';
import Newsletter from '../components/home/Newsletter';
import TrustBadges from '../components/home/TrustBadges';

function Home() {
  return (
    <div>
      <PromoStrip />
      <Hero
        title="Bienvenido a Brick Market"
        subtitle="Descubre sets increíbles y coleccionables"
      />
      <div className="container my-5">
        <h2 className="mb-4">Destacados</h2>
        <ProductCarousel />
        <h2 className="mt-5 mb-4">Categorías</h2>
        <CategoryCarousel />
        <ProductList />
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
