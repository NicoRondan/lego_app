import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import * as api from '../services/api';

// Page for listing products with filters, sorting and pagination
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [theme, setTheme] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [order, setOrder] = useState('price_asc');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProducts = async (pageParam = page) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getProducts({
        search,
        theme,
        minPrice,
        maxPrice,
        page: pageParam,
        limit,
        order,
      });
      setProducts(data.items);
      setTotal(data.total);
      setPage(data.page);
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
    fetchProducts(1);
  };

  return (
    <div>
      <h2 className="mb-4">Catálogo de productos</h2>
      <form className="row g-3 mb-4" onSubmit={handleSubmit}>
        <div className="col-md-3">
          <input
            type="text"
            className="form-control"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="text"
            className="form-control"
            placeholder="Tema"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Precio mínimo"
            min="0"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <input
            type="number"
            className="form-control"
            placeholder="Precio máximo"
            min="0"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <div className="col-md-2">
          <select
            className="form-select"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
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
      {total > limit && (
        <div className="d-flex justify-content-between align-items-center mt-3">
          <button
            className="btn btn-secondary"
            onClick={() => fetchProducts(page - 1)}
            disabled={page <= 1 || loading}
          >
            Anterior
          </button>
          <span>
            Página {page} de {Math.ceil(total / limit)}
          </span>
          <button
            className="btn btn-secondary"
            onClick={() => fetchProducts(page + 1)}
            disabled={page >= Math.ceil(total / limit) || loading}
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}

export default ProductsPage;
