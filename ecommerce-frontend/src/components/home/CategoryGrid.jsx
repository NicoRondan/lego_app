import React from 'react';
import { Link } from 'react-router-dom';
import categories from '../../data/categories';

function CategoryGrid() {
  return (
    <div className="row g-3">
      {categories.map((cat) => (
        <div key={cat.theme} className="col-6 col-md-3">
          <Link
            to={`/products?theme=${encodeURIComponent(cat.theme)}`}
            className="text-decoration-none"
          >
            <div className="position-relative">
              <img
                src={cat.image}
                alt={cat.name}
                className="img-fluid rounded"
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
  );
}

export default CategoryGrid;
