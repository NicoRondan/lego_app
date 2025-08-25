import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import categories from '../../data/categories';
import './CategoryCarousel.css';

function CategoryCarousel() {
  const getItemsPerSlide = () => (window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1);

  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slides = useMemo(() => {
    const grouped = [];
    for (let i = 0; i < categories.length; i += itemsPerSlide) {
      grouped.push(categories.slice(i, i + itemsPerSlide));
    }
    return grouped;
  }, [itemsPerSlide]);

  return (
    <div id="categoryCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {slides.map((group, idx) => (
          <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
            <div className="row g-3">
              {group.map((cat) => (
                <div className="col-12 col-md-6 col-lg-4" key={cat.theme}>
                  <Link
                    to={`/products?theme=${encodeURIComponent(cat.theme)}`}
                    className="text-decoration-none"
                  >
                    <div className="image-frame">
                      <img src={cat.image} alt={cat.name} loading="lazy" />
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        className="carousel-control-prev"
        type="button"
        data-bs-target="#categoryCarousel"
        data-bs-slide="prev"
      >
        <span className="carousel-control-prev-icon" aria-hidden="true" />
        <span className="visually-hidden">Previous</span>
      </button>
      <button
        className="carousel-control-next"
        type="button"
        data-bs-target="#categoryCarousel"
        data-bs-slide="next"
      >
        <span className="carousel-control-next-icon" aria-hidden="true" />
        <span className="visually-hidden">Next</span>
      </button>
    </div>
  );
}

export default CategoryCarousel;
