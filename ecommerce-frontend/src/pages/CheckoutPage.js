import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';

// Page for checking out: review cart, apply coupon, create order and payment
function CheckoutPage() {
  const { token } = useAuth();
  const [cart, setCart] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCart = async () => {
      if (!token) return;
      const data = await api.getCart(token);
      setCart(data);
    };
    fetchCart();
  }, [token]);

  const total = cart?.items?.reduce((sum, it) => sum + it.quantity * parseFloat(it.unitPrice), 0) || 0;

  const handleCheckout = async () => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setMessage('El carrito está vacío');
      return;
    }
    try {
      setLoading(true);
      const order = await api.createOrder({ couponCode: couponCode || undefined }, token);
      const payment = await api.createPaymentPreference(order.id, token);
      // In a real app you'd redirect user to payment.initPoint
      setMessage(`Orden creada. Dirígete a Mercado Pago: ${payment.initPoint}`);
    } catch (err) {
      console.error(err);
      setMessage('Error al procesar el pedido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Checkout</h2>
      {!cart || !cart.items || cart.items.length === 0 ? (
        <p>Tu carrito está vacío.</p>
      ) : (
        <>
          <table className="table mb-3">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.product?.name}</td>
                  <td>{item.quantity}</td>
                  <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                  <td>${(item.quantity * parseFloat(item.unitPrice)).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <h5>Total: ${total.toFixed(2)}</h5>
          <div className="mb-3">
            <label className="form-label">Cupón de descuento</label>
            <input
              type="text"
              className="form-control"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
            />
          </div>
          <button className="btn btn-primary" onClick={handleCheckout} disabled={loading}>
            {loading ? 'Procesando…' : 'Confirmar pedido y pagar'}
          </button>
        </>
      )}
      {message && <p className="mt-3 text-info">{message}</p>}
    </div>
  );
}

export default CheckoutPage;