import React, { useEffect, useState } from 'react';
import * as api from '../services/api';
import { useAuth } from '../contexts/AuthContext';

// Page to display the user's past orders
function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const data = await api.getOrders();
        setOrders(data);
      } catch (err) {
        console.error(err);
        setError('Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchOrders();
    }
  }, [user]);

  return (
    <div>
      <h2 className="mb-4">Mis pedidos</h2>
      {loading ? (
        <p>Cargando...</p>
      ) : error ? (
        <p className="text-danger">{error}</p>
      ) : orders && orders.length > 0 ? (
        <div className="accordion" id="ordersAccordion">
          {orders.map((order, idx) => (
            <div className="accordion-item" key={order.id}>
              <h2 className="accordion-header" id={`heading${idx}`}> 
                <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse${idx}`} aria-expanded="false" aria-controls={`collapse${idx}`}> 
                  Pedido #{order.id} - {order.status} - ${parseFloat(order.total).toFixed(2)}
                </button>
              </h2>
              <div id={`collapse${idx}`} className="accordion-collapse collapse" aria-labelledby={`heading${idx}`} data-bs-parent="#ordersAccordion">
                <div className="accordion-body">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cantidad</th>
                        <th>Precio</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.product?.name}</td>
                          <td>{item.quantity}</td>
                          <td>${parseFloat(item.unitPrice).toFixed(2)}</td>
                          <td>${parseFloat(item.subtotal).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {order.payment && (
                    <p><strong>Pago:</strong> {order.payment.provider} - {order.payment.status}</p>
                  )}
                  {order.shipment && (
                    <p><strong>Envío:</strong> {order.shipment.carrier} - {order.shipment.status}</p>
                  )}
                  {order.coupon && (
                    <p><strong>Cupón:</strong> {order.coupon.code} ({order.coupon.type} {order.coupon.value})</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No tienes pedidos.</p>
      )}
    </div>
  );
}

export default OrdersPage;