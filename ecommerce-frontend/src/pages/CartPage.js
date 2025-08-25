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
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td>
                    <img src={item.imageUrl} alt={item.name} width="60" />
                  </td>
                  <td>{item.name}</td>
                  <td>
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(qty) => handleUpdate(item.id, qty)}
                    />
                  </td>
                  <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td>
                    ${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}
                    <div className="text-muted small">
                      ${parseFloat(item.unitPrice).toFixed(2)} c/u
                    </div>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => handleRemove(item.id)}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <h5>Total: ${total.toFixed(2)}</h5>
          <div className="mt-3">
            <button className="btn btn-secondary me-2" onClick={handleClear}>
              Vaciar carrito
            </button>
            <button className="btn btn-success" onClick={() => navigate('/checkout')}>
              Realizar pedido
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default CartPage;
