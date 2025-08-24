import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import * as api from '../services/api';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import OrderSummary from '../components/OrderSummary';

// Page for checking out: review cart, apply coupon, create order and payment
function CheckoutPage() {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const schema = z.object({
    street: z.string().min(1, 'Requerida'),
    city: z.string().min(1, 'Requerida'),
    shipping: z.enum(['standard', 'express']),
    coupon: z.string().optional(),
  });

  const resolver = (values) => {
    const result = schema.safeParse(values);
    if (result.success) {
      return { values: result.data, errors: {} };
    }
    const formErrors = Object.entries(result.error.formErrors.fieldErrors).reduce(
      (acc, [key, val]) => ({ ...acc, [key]: { type: 'validation', message: val?.[0] } }),
      {}
    );
    return { values: {}, errors: formErrors };
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm({ resolver, defaultValues: { shipping: 'standard' } });

  useEffect(() => {
    const fetchCart = async () => {
      if (!user) return;
      const data = await api.getCart();
      setCart(data);
    };
    fetchCart();
  }, [user]);

  const subtotal = cart?.items?.reduce((sum, it) => sum + it.quantity * parseFloat(it.unitPrice), 0) || 0;
  const couponCode = watch('coupon');
  const discount = couponCode ? subtotal * 0.1 : 0;
  const tax = subtotal * 0.21;

  const onSubmit = async (data) => {
    if (!cart || !cart.items || cart.items.length === 0) {
      setMessage('El carrito está vacío');
      return;
    }
    try {
      setLoading(true);
      const order = await api.createOrder({ couponCode: data.coupon || undefined });
      const payment = await api.createPaymentPreference(order.id);
      window.location.href = payment.initPoint;
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
          <form onSubmit={handleSubmit(onSubmit)} className="mt-3" aria-label="Formulario de checkout">
            <div className="mb-3">
              <label className="form-label">Dirección</label>
              <input type="text" className="form-control" {...register('street')} aria-invalid={errors.street ? 'true' : 'false'} />
              {errors.street && <span className="text-danger">{errors.street.message}</span>}
            </div>
            <div className="mb-3">
              <label className="form-label">Ciudad</label>
              <input type="text" className="form-control" {...register('city')} aria-invalid={errors.city ? 'true' : 'false'} />
              {errors.city && <span className="text-danger">{errors.city.message}</span>}
            </div>
            <div className="mb-3">
              <label className="form-label">Envío</label>
              <select className="form-select" {...register('shipping')} aria-invalid={errors.shipping ? 'true' : 'false'}>
                <option value="standard">Standard</option>
                <option value="express">Express</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Cupón</label>
              <input type="text" className="form-control" {...register('coupon')} />
            </div>
            <OrderSummary subtotal={subtotal} tax={tax} discount={discount} />
            <button className="btn btn-primary mt-3" disabled={loading} type="submit">
              {loading ? 'Procesando…' : 'Confirmar pedido y pagar'}
            </button>
          </form>
        </>
      )}
      {message && <p className="mt-3 text-info">{message}</p>}
    </div>
  );
}

export default CheckoutPage;