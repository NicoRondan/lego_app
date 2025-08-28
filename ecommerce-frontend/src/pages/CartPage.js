import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import QuantityStepper from '../components/QuantityStepper';
import * as api from '../services/api';
import { useConfirm } from '../components/ConfirmProvider.jsx';

// Page that displays the user's cart and allows quantity adjustments and removal
function CartPage() {
  const { user } = useAuth();
  const { cart, fetchCart, updateItem, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const confirm = useConfirm();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await fetchCart();
      } catch (err) {
        console.error(err);
        setError('Error al cargar el carrito');
      } finally {
        setLoading(false);
      }
    };
    if (user) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleUpdate = async (itemId, qty) => {
    try {
      await updateItem(itemId, { quantity: qty });
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await removeItem(itemId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClear = async () => {
    const ok = await confirm({ title: 'Vaciar carrito', body: '¿Vaciar el carrito?' });
    if (!ok) return;
    try {
      await clearCart();
    } catch (err) {
      console.error(err);
    }
  };

  const subtotal = cart?.subtotal != null
    ? parseFloat(cart.subtotal)
    : (cart?.items?.reduce((sum, it) => sum + it.quantity * parseFloat(it.unitPrice), 0) || 0);
  const discount = cart?.discountTotal ? parseFloat(cart.discountTotal) : 0;
  const grand = Math.max(0, subtotal - discount);

  if (!user) {
    return (
      <div>
        <p>Debes iniciar sesión para acceder al carrito.</p>
        <Link to="/login">Iniciar sesión</Link>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-4">Tu carrito</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : !cart || !cart.summary || cart.summary.itemsCount === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <div className="row">
          <div className="col-md-8">
            <div className="table-responsive d-none d-md-block">
              <table className="table align-middle">
                <thead>
                  <tr>
                    <th>Imagen</th>
                    <th>Producto</th>
                    <th>Cantidad</th>
                    <th>Precio unitario</th>
                    <th>Subtotal</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <Link to={`/products/${item.productId}`}>
                          <img src={item.thumbnailUrl} alt={item.displayName} width="60" />
                        </Link>
                      </td>
                      <td>
                        <Link to={`/products/${item.productId}`} className="text-decoration-none">
                          {item.displayName}
                        </Link>
                      </td>
                      <td>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => handleUpdate(item.id, qty)}
                          min={1}
                        />
                      </td>
                      <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                      <td>${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}</td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                          onClick={() => handleRemove(item.id)}
                        >
                          <i className="fa-solid fa-trash" aria-hidden="true"></i>
                          <span className="visually-hidden">Eliminar</span>
                        </button>
                      </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
            <div className="d-md-none">
              {cart.items.map((item) => (
                <div className="card mb-3" key={item.id}>
                  <div className="row g-0">
                    <div className="col-4">
                      <Link to={`/products/${item.productId}`}>
                        <img src={item.thumbnailUrl} alt={item.displayName} className="img-fluid rounded-start" />
                      </Link>
                    </div>
                    <div className="col-8">
                      <div className="card-body">
                        <Link to={`/products/${item.productId}`} className="card-title h6 d-block text-decoration-none">
                          {item.displayName}
                        </Link>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => handleUpdate(item.id, qty)}
                          min={1}
                        />
                        <p className="card-text mt-2 mb-1">
                          <small className="text-muted">${parseFloat(item.unitPrice).toFixed(2)} c/u</small>
                        </p>
                        <p className="card-text fw-bold mb-2">
                          Subtotal: ${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
                        </p>
                        <button
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center"
                          onClick={() => handleRemove(item.id)}
                        >
                          <i className="fa-solid fa-trash me-1" aria-hidden="true"></i>
                          <span>Eliminar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="col-md-4">
            <div className="position-sticky top-0 p-3 bg-body-tertiary rounded border">
              <h5 className="mb-3">Resumen</h5>
              <p className="mb-1">Subtotal: ${subtotal.toFixed(2)}</p>
              {discount > 0 && <p className="mb-1 text-success">Descuento: -${discount.toFixed(2)}</p>}
              {cart?.couponCode && (
                <p className="mb-1">Cupón aplicado: <strong>{cart.couponCode}</strong>{' '}
                  <button
                    type="button"
                    className="btn btn-sm btn-outline-secondary ms-2"
                    onClick={async () => {
                      try {
                        await api.cartRemoveCoupon();
                        await fetchCart();
                        // Optionally set a toast; keeping UI minimal
                      } catch (err) {
                        // eslint-disable-next-line no-console
                        console.error(err);
                      }
                    }}
                  >Quitar</button>
                </p>
              )}
              <p className="mb-3">Total: ${grand.toFixed(2)}</p>
              <button
                className="btn btn-outline-danger w-100 mb-2 d-flex align-items-center justify-content-center"
                onClick={handleClear}
              >
                <i className="fa-solid fa-trash me-2" aria-hidden="true"></i>
                Vaciar carrito
              </button>
              <button
                className="btn btn-primary w-100 d-flex align-items-center justify-content-center"
                onClick={() => navigate('/checkout')}
                disabled={cart.summary.itemsCount === 0}
              >
                <i className="fa-solid fa-credit-card me-2" aria-hidden="true"></i>
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CartPage;
