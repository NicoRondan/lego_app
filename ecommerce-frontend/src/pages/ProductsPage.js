import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import * as api from '../services/api';

// Page for listing products with optional search and price filters
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts({ search, minPrice, maxPrice });
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchProducts();
  };

  return (
    <div>
      <h2 className="mb-4">Catálogo de productos</h2>
      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-4">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Precio mínimo"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="number"
            className="form-control"
            placeholder="Precio máximo"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="col-md-2 d-grid">
          <button type="submit" className="btn btn-primary">
            Filtrar
          </button>
        </div>
      </form>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : (
        <div className="row">
          {products && products.length > 0 ? (
            products.map((prod) => <ProductCard key={prod.id} product={prod} />)
          ) : (
            <p>No se encontraron productos.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default ProductsPage;