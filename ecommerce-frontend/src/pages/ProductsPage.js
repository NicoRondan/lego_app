import React, { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import FiltersBar from '../components/FiltersBar';
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
      <div className="d-flex align-items-start gap-4">
        <FiltersBar
          search={search}
          theme={theme}
          minPrice={minPrice}
          maxPrice={maxPrice}
          order={order}
          onSearchChange={setSearch}
          onThemeChange={setTheme}
          onMinPriceChange={setMinPrice}
          onMaxPriceChange={setMaxPrice}
          onOrderChange={setOrder}
          onSubmit={handleSubmit}
        />
        <div className="flex-grow-1">
          {loading ? (
            <p>Cargando...</p>
          ) : error ? (
            <p className="text-danger">{error}</p>
          ) : (
            <div className="lego-container">
              <div className="row g-3">
                {products && products.length > 0 ? (
                  products.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))
                ) : (
                  <p>No se encontraron productos.</p>
                )}
              </div>
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
      </div>
    </div>
  );
}

export default ProductsPage;
