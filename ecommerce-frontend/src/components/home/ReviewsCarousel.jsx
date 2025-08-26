import React, { useEffect, useState } from 'react';
import * as api from '../../services/api';

const mockReviews = [
  {
    name: 'Ana',
    comment: 'Excelente servicio y productos.',
    rating: 5,
  },
  {
    name: 'Luis',
    comment: 'Muy buena calidad, volveré a comprar.',
    rating: 4,
  },
  {
    name: 'María',
    comment: 'Entrega rápida y sin problemas.',
    rating: 5,
  },
  {
    name: 'Juan',
    comment: 'Gran variedad de sets.',
    rating: 3,
  },
  {
    name: 'Carla',
    comment: 'Me encantó el soporte recibido.',
    rating: 4,
  },
];

function ReviewsCarousel() {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    api
      .getReviews({ limit: 10 })
      .then((data) =>
        setReviews(
          (data.items || data).map((r) => ({
            name: r.name || r.user?.name,
            comment: r.comment,
            rating: r.rating || 0,
          }))
        )
      )
      .catch(() => setReviews(mockReviews));
  }, []);

  if (!reviews.length) return null;

  return (
    <div className="lego-container">
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
                <small className="d-block mb-2">
                  - {r.name}
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <i
                      key={i}
                      className="bi bi-star-fill text-warning ms-1"
                    />
                  ))}
                </small>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ReviewsCarousel;
