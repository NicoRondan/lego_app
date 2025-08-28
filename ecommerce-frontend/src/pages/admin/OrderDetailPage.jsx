import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminGetOrder, adminUpdateOrderStatus, adminShipOrder, adminRefundOrder, adminGetPaymentAudit } from '../../services/api';

const statuses = ['pending', 'paid', 'picking', 'shipped', 'delivered', 'canceled', 'refunded'];

function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusTo, setStatusTo] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [ship, setShip] = useState({ carrier: '', tracking: '' });
  const [refund, setRefund] = useState({ amount: '', reason: '' });
  const [paymentAudit, setPaymentAudit] = useState(null);

  const refresh = useCallback(() => {
    setLoading(true);
    setError('');
    adminGetOrder(id)
      .then((o) => {
        setOrder(o);
        setLoading(false);
        if (o.payment?.id || o.payment?.externalId) {
          adminGetPaymentAudit(o.payment.id || o.payment.externalId).then(setPaymentAudit).catch(() => {});
        }
      })
      .catch((e) => { setError(e.message || 'Error'); setLoading(false); });
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  const doUpdateStatus = async () => {
    try {
      await adminUpdateOrderStatus(id, { to: statusTo, note: statusNote });
      setStatusNote('');
      setStatusTo('');
      refresh();
    } catch {}
  };

  const doShip = async () => {
    try {
      await adminShipOrder(id, ship);
      setShip({ carrier: '', tracking: '' });
      refresh();
    } catch {}
  };

  const doRefund = async () => {
    try {
      await adminRefundOrder(id, { amount: parseFloat(refund.amount), reason: refund.reason });
      setRefund({ amount: '', reason: '' });
      refresh();
    } catch {}
  };

  if (loading) return <AdminLayout><div>Cargando...</div></AdminLayout>;
  if (error) return <AdminLayout><div className="alert alert-danger">{error}</div></AdminLayout>;
  if (!order) return <AdminLayout><div>No encontrado</div></AdminLayout>;

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h2>Pedido #{order.id}</h2>
        <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>Volver</button>
      </div>
      <p className="text-muted mb-3">Consulta el detalle completo del pedido, historial de estados y auditoría de pagos. Puedes actualizar estado, marcar envío o registrar reembolso.</p>

      <div className="row g-3">
        <div className="col-md-8">
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between">
                <div>
                  <div className="mb-2"><strong>Estado:</strong> <span className="badge bg-secondary text-uppercase">{order.status}</span></div>
                  <div className="mb-2"><strong>Pago:</strong> {(order.paymentStatus || order.payment?.status) || 'N/D'} {order.payment?.externalId ? `( ${order.payment.externalId} )` : ''}</div>
                  <div className="mb-2"><strong>Total:</strong> {order.grandTotal || order.total} {order.currency}</div>
                  <div className="mb-2"><strong>Cliente:</strong> {order.User?.email}</div>
                  {order.couponCode && <div className="mb-2"><strong>Cupón:</strong> {order.couponCode}</div>}
                </div>
                <div className="text-end text-muted">
                  <div>Creado: {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}</div>
                  <div>Actualizado: {order.updatedAt ? new Date(order.updatedAt).toLocaleString() : ''}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">Items</div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th></th>
                      <th>Producto</th>
                      <th>Cantidad</th>
                      <th>Precio</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items?.map((it) => (
                      <tr key={it.id}>
                        <td>{it.thumbnailUrl && <img alt="thumb" src={it.thumbnailUrl} style={{ width: 48, height: 48, objectFit: 'cover' }} />}</td>
                        <td>
                          <div>{it.displayName || `Producto ${it.productId}`}</div>
                          <div><Link to={`/products/${it.productId}`}>Ver PDP</Link></div>
                        </td>
                        <td>{it.quantity}</td>
                        <td>{it.unitPrice} {it.currency || order.currency}</td>
                        <td>{it.lineSubtotal || it.subtotal}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">Historial de estados</div>
            <div className="card-body">
              {order.statusHistory?.length ? (
                <ul className="list-group list-group-flush">
                  {order.statusHistory.map((h) => (
                    <li key={h.id} className="list-group-item d-flex justify-content-between">
                      <div>
                        <div className="small text-muted">{h.created_at ? new Date(h.created_at).toLocaleString() : ''}</div>
                        <div>{h.from} → {h.to}</div>
                        {h.note && <div className="text-muted">{h.note}</div>}
                      </div>
                      <div className="text-muted">by {h.changedBy || 'system'}</div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-muted">Sin historial</div>
              )}
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">Pagos (webhooks)</div>
            <div className="card-body">
              {paymentAudit ? (
                <div>
                  <div className="mb-2">Proveedor: {paymentAudit.provider} | Estado: {paymentAudit.status} | ID externo: {paymentAudit.externalId}</div>
                  <ul className="list-group">
                    {paymentAudit.events?.map((e) => (
                      <li key={e.id} className="list-group-item">
                        <div className="small text-muted">{e.created_at ? new Date(e.created_at).toLocaleString() : ''}</div>
                        <pre className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>{JSON.stringify(e.payload, null, 2)}</pre>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <div className="text-muted">Sin eventos</div>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card mb-3">
            <div className="card-header">Cambiar estado</div>
            <div className="card-body">
              <div className="mb-2">
                <select className="form-select" value={statusTo} onChange={(e) => setStatusTo(e.target.value)}>
                  <option value="">Seleccionar...</option>
                  {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="mb-2">
                <input className="form-control" placeholder="Nota" value={statusNote} onChange={(e) => setStatusNote(e.target.value)} />
              </div>
              <button className="btn btn-primary" onClick={doUpdateStatus} disabled={!statusTo}>Aplicar</button>
              <div className="form-text">Registra transición. No permite pasar a paid/refunded.</div>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">Marcar como enviado</div>
            <div className="card-body">
              <div className="mb-2">
                <input className="form-control" placeholder="Carrier" value={ship.carrier} onChange={(e) => setShip({ ...ship, carrier: e.target.value })} />
              </div>
              <div className="mb-2">
                <input className="form-control" placeholder="Tracking" value={ship.tracking} onChange={(e) => setShip({ ...ship, tracking: e.target.value })} />
              </div>
              <button className="btn btn-outline-primary" onClick={doShip}>Marcar enviado</button>
            </div>
          </div>

          <div className="card mb-3">
            <div className="card-header">Reembolsar</div>
            <div className="card-body">
              <div className="mb-2">
                <input type="number" className="form-control" placeholder="Monto" value={refund.amount} onChange={(e) => setRefund({ ...refund, amount: e.target.value })} />
              </div>
              <div className="mb-2">
                <input className="form-control" placeholder="Motivo" value={refund.reason} onChange={(e) => setRefund({ ...refund, reason: e.target.value })} />
              </div>
              <button className="btn btn-outline-danger" onClick={doRefund}>Reembolsar</button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrderDetailPage;
