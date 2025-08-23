import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Page to display detailed information about a single product
function ProductDetailPage() {
  const { id } = useParams();
  const { token } = useAuth();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error(err);
        setError('Producto no encontrado');
      }
    };
    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!token) {
      setMessage('Por favor inicia sesión para añadir al carrito');
      return;
    }
    try {
      setLoading(true);
      await api.addToCart({ productId: product.id, quantity }, token);
      setMessage('Producto añadido al carrito');
    } catch (err) {
      console.error(err);
      setMessage('Error al añadir al carrito');
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return <p className="text-danger">{error}</p>;
  }
  if (!product) {
    return <p>Cargando...</p>;
  }
  return (
    <div>
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      <p className="fw-bold">Precio: ${parseFloat(product.price).toFixed(2)}</p>
      <p>
        Categorías: {product.categories && product.categories.map((c) => c.name).join(', ')}
      </p>
      <div className="mb-3">
        <label className="form-label">Cantidad</label>
        <input
          type="number"
          min="1"
          className="form-control"
          value={quantity}
          onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
        />
      </div>
      <button onClick={handleAddToCart} className="btn btn-success" disabled={loading}>
        {loading ? 'Añadiendo…' : 'Añadir al carrito'}
      </button>
      {message && <p className="mt-3 text-info">{message}</p>}
      <hr />
      <h5>Reseñas</h5>
      {product.reviews && product.reviews.length > 0 ? (
        <ul className="list-group">
          {product.reviews.map((rev) => (
            <li key={rev.id} className="list-group-item">
              <strong>{rev.user?.name || 'Anónimo'}:</strong> {rev.comment} ({rev.rating}/5)
            </li>
          ))}
        </ul>
      ) : (
        <p>Aún no hay reseñas.</p>
      )}
    </div>
  );
}

export default ProductDetailPage;