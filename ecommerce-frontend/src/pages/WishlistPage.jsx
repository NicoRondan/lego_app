import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext.jsx';
import { useConfirm } from '../components/ConfirmProvider.jsx';
import AddToCartControls from '../components/AddToCartControls.jsx';

// Simple page that lists the user's wishlist items using WishlistContext
function WishlistPage() {
  const { user } = useAuth();
  const { items, loading, refresh, removeItem } = useWishlist();
  const confirm = useConfirm();

  useEffect(() => {
    if (user) refresh().catch(() => {});
  }, [user, refresh]);

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
      ) : !items || items.length === 0 ? (
        <p>No tienes productos en tu wishlist.</p>
      ) : (
        <ul className="list-group">
          {items.map((item) => {
            const p = item.product || item.Product || {};
            return (
              <li key={item.id} className="list-group-item d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  {p.imageUrl && (
                    <img src={p.imageUrl} alt={p.name || 'Producto'} width="60" height="60" style={{ objectFit: 'cover' }} />
                  )}
                  <div>
                    <Link to={`/products/${p.id}`}>{p.name || `Producto ${p.id || ''}`}</Link>
                    {p.price != null && (
                      <div className="text-muted small">${parseFloat(p.price).toFixed(2)}</div>
                    )}
                    {item.addedAt && (
                      <div className="text-muted small">Agregado el {new Date(item.addedAt).toLocaleDateString('es-AR')}</div>
                    )}
                  </div>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <AddToCartControls product={p} />
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={async () => {
                      const ok = await confirm({ title: 'Quitar de wishlist', body: `¿Quitar "${p.name || 'este producto'}" de tu wishlist?` });
                      if (!ok) return;
                      await removeItem(item.id);
                    }}
                  >
                    Quitar
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

export default WishlistPage;
