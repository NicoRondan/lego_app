import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import QuantityStepper from '../components/QuantityStepper';

// Page that displays the user's cart and allows quantity adjustments and removal
function CartPage() {
  const { user } = useAuth();
  const { cart, fetchCart, updateItem, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    if (!window.confirm('¿Vaciar el carrito?')) return;
    try {
      await clearCart();
    } catch (err) {
      console.error(err);
    }
  };

  const total = cart?.items?.reduce((sum, it) => sum + it.quantity * parseFloat(it.unitPrice), 0) || 0;

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
                      <td><img src={item.imageUrl} alt={item.name} width="60" /></td>
                      <td>
                        <Link to={`/products/${item.productId || item.product?.id}`}>{item.name}</Link>
                      </td>
                      <td>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => handleUpdate(item.id, qty)}
                          min={1}
                          max={item.stock}
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
                      <img src={item.imageUrl} alt={item.name} className="img-fluid rounded-start" />
                    </div>
                    <div className="col-8">
                      <div className="card-body">
                        <Link to={`/products/${item.productId || item.product?.id}`} className="card-title h6 d-block">
                          {item.name}
                        </Link>
                        <QuantityStepper
                          value={item.quantity}
                          onChange={(qty) => handleUpdate(item.id, qty)}
                          min={1}
                          max={item.stock}
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
              <p className="mb-1">Subtotal: ${total.toFixed(2)}</p>
              <p className="mb-3">Total: ${total.toFixed(2)}</p>
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
