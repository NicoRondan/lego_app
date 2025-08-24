import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import QuantityStepper from '../components/QuantityStepper';

// Page that displays the user's cart and allows quantity adjustments and removal
function CartPage() {
  const { token, user } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchCart = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCart(token);
      setCart(data);
    } catch (err) {
      console.error(err);
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const handleUpdate = async (itemId, qty) => {
    try {
      await api.updateCartItem(itemId, { quantity: qty }, token);
      fetchCart();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await api.removeCartItem(itemId, token);
      fetchCart();
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
      ) : !cart || !cart.items || cart.items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
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
                  <td>{item.product?.name}</td>
                  <td>
                    <QuantityStepper
                      value={item.quantity}
                      onChange={(qty) => handleUpdate(item.id, qty)}
                    />
                  </td>
                  <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td>${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}</td>
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
          <button className="btn btn-success" onClick={() => navigate('/checkout')}>Realizar pedido</button>
        </>
      )}
    </div>
  );
}

export default CartPage;