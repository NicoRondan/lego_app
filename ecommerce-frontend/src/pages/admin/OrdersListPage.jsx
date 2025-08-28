import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { adminListOrders } from '../../services/api';
import { API_URL } from '../../services/api';

const statuses = ['pending', 'paid', 'picking', 'shipped', 'delivered', 'canceled', 'refunded'];

function OrdersListPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState({ data: [], page: 1, pageSize: 20, total: 0 });
  const [filters, setFilters] = useState({ status: '', q: '', from: '', to: '', page: 1, pageSize: 20 });

  useEffect(() => {
    setLoading(true);
    setError('');
    adminListOrders(filters)
      .then(setData)
      .catch((e) => setError(e.message || 'Error'))
      .finally(() => setLoading(false));
  }, [filters]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil((data.total || 0) / (filters.pageSize || 20))), [data.total, filters.pageSize]);

  const exportCsv = () => {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', filters.status);
    if (filters.q) params.set('q', filters.q);
    if (filters.from) params.set('from', filters.from);
    if (filters.to) params.set('to', filters.to);
    params.set('format', 'csv');
    const url = `${API_URL}/admin/orders?${params.toString()}`;
    window.location.href = url;
  };

  return (
    <AdminLayout>
      <div className="d-flex justify-content-between align-items-center mb-1">
        <h2>Pedidos</h2>
        <button className="btn btn-outline-secondary" onClick={exportCsv}>Export CSV</button>
      </div>
      <p className="text-muted">Filtra y navega pedidos por estado, búsqueda y rango de fechas. Exporta resultados a CSV.</p>

      <div className="row g-3 mb-3">
        <div className="col-md-2">
          <label className="form-label">Estado</label>
          <select className="form-select" value={filters.status} onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}>
            <option value="">Todos</option>
            {statuses.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <label className="form-label">Buscar (email / paymentId / ordenId)</label>
          <input className="form-control" value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value, page: 1 })} placeholder="user@mail.com o 123" />
        </div>
        <div className="col-md-2">
          <label className="form-label">Desde</label>
          <input type="date" className="form-control" value={filters.from} onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Hasta</label>
          <input type="date" className="form-control" value={filters.to} onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })} />
        </div>
        <div className="col-md-2 align-self-end">
          <button className="btn btn-primary w-100" onClick={() => setFilters({ ...filters })}>Filtrar</button>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-striped align-middle">
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Pago</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {data.data.map((o) => (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{o.createdAt ? new Date(o.createdAt).toLocaleString() : ''}</td>
                  <td>{o.User?.email || ''}</td>
                  <td><span className="badge bg-secondary text-uppercase">{o.status}</span></td>
                  <td>{o.grandTotal || o.total} {o.currency}</td>
                  <td>{o.paymentStatus || o.payment?.status} {o.payment?.externalId ? `( ${o.payment.externalId} )` : ''}</td>
                  <td className="text-end">
                    <Link className="btn btn-sm btn-outline-primary" to={`/admin/orders/${o.id}`}>Ver</Link>
                  </td>
                </tr>
              ))}
              {!data.data.length && (
                <tr><td colSpan="7" className="text-center text-muted">Sin resultados</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-center mt-3">
        <div>Mostrando {data.data.length} de {data.total}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>«</button>
          <span className="btn btn-outline-secondary disabled">{filters.page} / {totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={filters.page >= totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>»</button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default OrdersListPage;
