import React from 'react';
import { Link } from 'react-router-dom';
import categories from '../../data/categories';
import MultiItemCarousel from './MultiItemCarousel';

function CategoryCarousel() {
  const renderCategory = (cat) => (
    <Link
      to={`/products?theme=${encodeURIComponent(cat.theme)}`}
      className="text-decoration-none"
    >
      <div className="image-frame" style={{ height: '150px' }}>
        <img src={cat.image} alt={cat.name} loading="lazy" style={{ objectFit: 'contain' }} />
      </div>
    </Link>
  );

  return (
    <MultiItemCarousel
      id="categoryCarousel"
      items={categories}
      renderItem={renderCategory}
    />
  );
}

export default CategoryCarousel;

