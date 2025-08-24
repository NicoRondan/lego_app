import React from 'react';

// Accessible filters bar for product listings
function FiltersBar({
  search,
  theme,
  minPrice,
  maxPrice,
  order,
  onSearchChange,
  onThemeChange,
  onMinPriceChange,
  onMaxPriceChange,
  onOrderChange,
  onSubmit,
}) {
  return (
    <form className="row g-3 mb-4" onSubmit={onSubmit} role="search" aria-label="Filtros de productos">
      <div className="col-md-3">
        <input
          type="text"
          className="form-control"
          placeholder="Buscar"
          aria-label="Buscar"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <input
          type="text"
          className="form-control"
          placeholder="Tema"
          aria-label="Tema"
          value={theme}
          onChange={(e) => onThemeChange(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <input
          type="number"
          className="form-control"
          placeholder="Precio mínimo"
          aria-label="Precio mínimo"
          min="0"
          value={minPrice}
          onChange={(e) => onMinPriceChange(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <input
          type="number"
          className="form-control"
          placeholder="Precio máximo"
          aria-label="Precio máximo"
          min="0"
          value={maxPrice}
          onChange={(e) => onMaxPriceChange(e.target.value)}
        />
      </div>
      <div className="col-md-2">
        <select
          className="form-select"
          aria-label="Orden"
          value={order}
          onChange={(e) => onOrderChange(e.target.value)}
        >
          <option value="price_asc">Precio ↑</option>
          <option value="price_desc">Precio ↓</option>
        </select>
      </div>
      <div className="col-md-1 d-grid">
        <button type="submit" className="btn btn-primary">
          Filtrar
        </button>
      </div>
    </form>
  );
}

export default FiltersBar;
