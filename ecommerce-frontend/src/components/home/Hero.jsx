import React from 'react';
import { Link } from 'react-router-dom';
import VideoBackground from './VideoBackground';

function Hero({ title, subtitle, ctaHref = '/products' }) {
  return (
    <section className="position-relative text-center text-white">
      <VideoBackground
        className="w-100"
        poster="/assets/home/hero-fallback.jpg"
        sources={[
          { src: '/assets/home/hero.webm', type: 'video/webm' },
          { src: '/assets/home/hero.mp4', type: 'video/mp4' },
        ]}
      />
      <div className="position-absolute top-50 start-50 translate-middle">
        <h1 className="display-4">{title}</h1>
        <p className="lead mb-4">{subtitle}</p>
        <Link to={ctaHref} className="btn btn-primary btn-lg">
          Ver productos
        </Link>
      </div>
    </section>
  );
}

export default Hero;
