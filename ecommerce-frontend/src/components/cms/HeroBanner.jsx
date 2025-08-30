import React from 'react';
import { Link } from 'react-router-dom';

function HeroBanner({ banner }) {
  if (!banner) return null;
  const content = (
    <img
      src={banner.imageUrl}
      alt={banner.title}
      className="img-fluid w-100 rounded"
      style={{ maxHeight: '420px', objectFit: 'cover' }}
      loading="lazy"
    />
  );
  return (
    <section className="mb-4">
      {banner.linkUrl ? (
        <Link to={banner.linkUrl} className="text-decoration-none">
          {content}
        </Link>
      ) : (
        content
      )}
    </section>
  );
}

export default HeroBanner;

