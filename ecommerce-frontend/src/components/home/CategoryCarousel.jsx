import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import categories from '../../data/categories';
import './CategoryCarousel.css';

function CategoryCarousel() {
  useEffect(() => {
    const handleResize = () => {
      const items = document.querySelectorAll('#categoryCarousel .carousel-item');
      const minPerSlide = window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1;

      items.forEach((el) => {
        while (el.children.length > 1) {
          el.removeChild(el.lastChild);
        }
        let next = el.nextElementSibling;
        for (let i = 1; i < minPerSlide; i++) {
          if (!next) next = items[0];
          const clone = next.firstElementChild.cloneNode(true);
          el.appendChild(clone);
          next = next.nextElementSibling;
        }
      });
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div id="categoryCarousel" className="carousel slide" data-bs-ride="carousel">
      <div className="carousel-inner">
        {categories.map((cat, idx) => (
          <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={cat.theme}>
            <div className="col-12 col-md-6 col-lg-4">
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
