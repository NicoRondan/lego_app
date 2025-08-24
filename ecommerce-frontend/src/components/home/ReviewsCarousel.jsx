import React, { useEffect, useState } from 'react';

const mockReviews = [
  {
    name: 'Ana',
    comment: 'Excelente servicio y productos.',
  },
  {
    name: 'Luis',
    comment: 'Muy buena calidad, volveré a comprar.',
  },
  {
    name: 'María',
    comment: 'Entrega rápida y sin problemas.',
  },
  {
    name: 'Juan',
    comment: 'Gran variedad de sets.',
  },
  {
    name: 'Carla',
    comment: 'Me encantó el soporte recibido.',
  },
];

function ReviewsCarousel() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    fetch('/reviews?limit=10')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => setReviews(data))
      .catch(() => setReviews(mockReviews));
  }, []);

  if (!reviews.length) return null;

  return (
    <div
      id="reviewsCarousel"
      className="carousel slide"
      data-bs-ride="carousel"
      data-bs-interval="8000"
    >
      <div className="carousel-inner">
        {reviews.map((r, idx) => (
          <div
            className={`carousel-item ${idx === 0 ? 'active' : ''}`}
            key={idx}
          >
            <div className="p-4 text-center">
              <p className="mb-1">"{r.comment}"</p>
              <small className="d-block mb-2">- {r.name}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ReviewsCarousel;
