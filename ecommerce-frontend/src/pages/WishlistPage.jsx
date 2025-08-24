import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

// Simple page that lists the user's wishlist items
function WishlistPage() {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadWishlist = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlist();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (!user) {
    return (
      <div>
        <p>Debes iniciar sesión para ver tu wishlist.</p>
        <Link to="/login">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Mi wishlist</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : !wishlist || !wishlist.items || wishlist.items.length === 0 ? (
        <p>No tienes productos en tu wishlist.</p>
      ) : (
        <ul className="list-group">
          {wishlist.items.map((item) => (
            <li
              key={item.id}
              className="list-group-item d-flex justify-content-between align-items-center"
            >
              <Link to={`/products/${item.product?.id}`}>{item.product?.name}</Link>
              <button
                className="btn btn-sm btn-outline-danger"
                onClick={async () => {
                  try {
                    await api.removeFromWishlist(item.id);
                    loadWishlist();
                  } catch (err) {
                    console.error(err);
                  }
                }}
              >
                Quitar
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WishlistPage;
