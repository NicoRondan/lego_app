import React, { useEffect, useState, useMemo } from 'react';
import './MultiItemCarousel.css';

function MultiItemCarousel({ id, items = [], renderItem }) {
  const getItemsPerSlide = () => (window.innerWidth >= 992 ? 3 : window.innerWidth >= 768 ? 2 : 1);
  const [itemsPerSlide, setItemsPerSlide] = useState(getItemsPerSlide());

  useEffect(() => {
    const handleResize = () => setItemsPerSlide(getItemsPerSlide());
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const slides = useMemo(() => {
    const grouped = [];
    for (let i = 0; i < items.length; i += itemsPerSlide) {
      grouped.push(items.slice(i, i + itemsPerSlide));
    }
    return grouped;
  }, [items, itemsPerSlide]);

  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="carousel-wrapper">
      <div id={id} className="carousel slide lego-carousel" data-bs-ride="carousel">
        <div className="carousel-inner">
          {slides.map((group, idx) => (
            <div className={`carousel-item ${idx === 0 ? 'active' : ''}`} key={idx}>
              <div className="row g-3">
                {group.map((item, i) => (
                  <div className="col-12 col-md-6 col-lg-4" key={i}>
                    {renderItem(item)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {slides.length > 1 && (
          <>
            <button
              className="carousel-control-prev"
              type="button"
              data-bs-target={`#${id}`}
              data-bs-slide="prev"
            >
              <span className="carousel-control-prev-icon" aria-hidden="true" />
              <span className="visually-hidden">Previous</span>
            </button>
            <button
              className="carousel-control-next"
              type="button"
              data-bs-target={`#${id}`}
              data-bs-slide="next"
            >
              <span className="carousel-control-next-icon" aria-hidden="true" />
              <span className="visually-hidden">Next</span>
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default MultiItemCarousel;

