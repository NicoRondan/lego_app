import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import QuantityStepper from '../components/QuantityStepper';

// Page to display detailed information about a single product
function ProductDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [inWishlist, setInWishlist] = useState(false);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await api.getProductById(id);
        setProduct(data);
        if (user) {
          // Fetch wishlist but tolerate missing list for new users
          const wl = await api.getWishlist().catch(() => null);
          setInWishlist(wl?.items?.some((it) => it.product?.id === data.id));
        }
      } catch (err) {
        console.error(err);
        setError('Producto no encontrado');
      }
    };
    fetchProduct();
  }, [id, user]);

  useEffect(() => {
    setMessage(null);
  }, [user]);

  const handleAddToCart = async () => {
    setMessage(null);
    try {
      setLoading(true);
      await addItem({ productId: product.id, quantity });
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
      {product.primaryImageUrl && (
        <img
          src={product.primaryImageUrl}
          alt={product.name}
          className="img-fluid mb-3"
        />
      )}
      <h2>{product.name}</h2>
      <p>{product.description}</p>
      {product.recommendedAgeMin != null && product.recommendedAgeMax != null && (
        <p>
          Edad recomendada: {product.recommendedAgeMin}
          {product.recommendedAgeMax !== product.recommendedAgeMin
            ? `-${product.recommendedAgeMax}`
            : '+'}
        </p>
      )}
      <p className="fw-bold">Precio: ${parseFloat(product.price).toFixed(2)}</p>
      <p>
        Categorías: {product.categories && product.categories.map((c) => c.name).join(', ')}
      </p>
      <div className="mb-3" aria-label="Cantidad">
        <label className="form-label">Cantidad</label>
        <QuantityStepper value={quantity} onChange={setQuantity} />
      </div>
      <button onClick={handleAddToCart} className="btn btn-success me-2" disabled={loading}>
        {loading ? 'Añadiendo…' : 'Añadir al carrito'}
      </button>
      <button onClick={async () => {
          if (!user) {
            setMessage('Inicia sesión para administrar la wishlist');
            return;
          }
          try {
            if (inWishlist) {
              const wl = await api.getWishlist();
              const item = wl.items.find((it) => it.product?.id === product.id);
              if (item) await api.removeFromWishlist(item.id);
              setInWishlist(false);
            } else {
              await api.addToWishlist(product.id);
              setInWishlist(true);
            }
          } catch (err) {
            console.error(err);
            setMessage('Error al actualizar la wishlist');
          }
        }}
        className="btn btn-outline-secondary"
      >
        {inWishlist ? 'Quitar de wishlist' : 'Añadir a wishlist'}
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
      {user && (
        <form
          className="mt-3"
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await api.createReview(product.id, review);
              const updated = await api.getProductById(id);
              setProduct(updated);
              setReview({ rating: 5, comment: '' });
            } catch (err) {
              console.error(err);
              setMessage('Error al enviar reseña');
            }
          }}
        >
          <div className="mb-2">
            <label className="form-label">Calificación</label>
            <input
              type="number"
              className="form-control"
              min="1"
              max="5"
              value={review.rating}
              onChange={(e) => setReview({ ...review, rating: parseInt(e.target.value, 10) })}
            />
          </div>
          <div className="mb-2">
            <label className="form-label">Comentario</label>
            <textarea
              className="form-control"
              value={review.comment}
              onChange={(e) => setReview({ ...review, comment: e.target.value })}
            />
          </div>
          <button className="btn btn-primary">Enviar reseña</button>
        </form>
      )}
    </div>
  );
}

export default ProductDetailPage;