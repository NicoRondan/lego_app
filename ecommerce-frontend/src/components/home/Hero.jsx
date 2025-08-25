import React from 'react';
import { Link } from 'react-router-dom';
import VideoBackground from './VideoBackground';
import BrickButton from '../lego/BrickButton';

function Hero({ title, subtitle, ctaHref = '/products' }) {
  return (
    <section
      className="position-relative text-center text-white overflow-hidden"
      style={{ minHeight: '60vh' }}
    >
      <VideoBackground
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ objectFit: 'cover', objectPosition: 'center top' }}
        poster="/assets/home/hero-fallback.jpg"
        sources={[
          { src: '/assets/home/hero.webm', type: 'video/webm' },
          { src: '/assets/home/hero.mp4', type: 'video/mp4' },
        ]}
      />
      <div className="position-absolute top-50 start-50 translate-middle lego-plate tex p-4 rounded text-dark">
        <h1 className="display-4">{title}</h1>
        <p className="lead mb-4">{subtitle}</p>
        <Link to={ctaHref} className="text-decoration-none">
          <BrickButton className="btn-lg">Ver productos</BrickButton>
        </Link>
      </div>
      <div
        className="position-absolute bottom-0 start-0 w-100"
        style={{
          height: '20%',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0), var(--bs-body-bg))',
        }}
      />
      <div
        className="position-absolute top-0 start-0 w-100"
        style={{
          height: '20%',
          background: 'linear-gradient(to bottom, var(--bs-body-bg), rgba(0,0,0,0))',
        }}
      />
      <div
        className="position-absolute top-0 start-0 h-100"
        style={{
          width: '20%',
          background: 'linear-gradient(to right, var(--bs-body-bg), rgba(0,0,0,0))',
        }}
      />
      <div
        className="position-absolute top-0 end-0 h-100"
        style={{
          width: '20%',
          background: 'linear-gradient(to left, var(--bs-body-bg), rgba(0,0,0,0))',
        }}
      />
    </section>
  );
}

export default Hero;
