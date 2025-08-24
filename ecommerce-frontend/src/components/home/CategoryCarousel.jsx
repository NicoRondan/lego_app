import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import categories from '../../data/categories';
import './CategoryCarousel.css';

function CategoryCarousel() {
  const [itemsPerSlide, setItemsPerSlide] = useState(1);
  const [index, setIndex] = useState(0);

  const updateItemsPerSlide = () => {
    if (window.innerWidth >= 992) return 3;
    if (window.innerWidth >= 768) return 2;
    return 1;
  };

  useEffect(() => {
    const handleResize = () => {
      setItemsPerSlide(updateItemsPerSlide());
      setIndex(0);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, categories.length - itemsPerSlide);

  const next = () => setIndex((i) => Math.min(i + itemsPerSlide, maxIndex));
  const prev = () => setIndex((i) => Math.max(i - itemsPerSlide, 0));

  return (
    <div className="category-carousel position-relative">
      <div
        className="carousel-inner d-flex"
        style={{ transform: `translateX(-${(100 / itemsPerSlide) * index}%)` }}
      >
        {categories.map((cat) => (
          <div
            key={cat.theme}
            className="carousel-item flex-shrink-0"
            style={{ width: `${100 / itemsPerSlide}%` }}
          >
            <Link
              to={`/products?theme=${encodeURIComponent(cat.theme)}`}
              className="text-decoration-none"
            >
              <div className="position-relative">
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="d-block w-100 rounded"
                  loading="lazy"
                />
                <span className="position-absolute top-50 start-50 translate-middle text-white fw-bold">
                  {cat.name}
                </span>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        onClick={prev}
        disabled={index === 0}
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        onClick={next}
        disabled={index >= maxIndex}
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default CategoryCarousel;

