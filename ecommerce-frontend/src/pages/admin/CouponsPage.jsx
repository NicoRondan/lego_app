import React, { useEffect, useMemo, useState } from 'react';
import * as api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout.jsx';

function CouponForm({ initial = {}, onSubmit, submitting, categories = [] }) {
  const [form, setForm] = useState({
    code: '', type: 'percent', value: 10, status: 'active',
    validFrom: '', validTo: '', minSubtotal: '', maxUses: '', perUserLimit: '',
    allowedThemes: '', disallowProducts: '', stackable: false,
    ...initial,
  });
  const themeListId = useMemo(() => 'themes-list', []);
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="row g-2">
      <div className="col-auto">
        <input className="form-control" placeholder="CODE" value={form.code}
          onChange={(e) => setForm({ ...form, code: e.target.value })} required />
      </div>
      <div className="col-auto">
        <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="percent">Percent</option>
          <option value="fixed">Fixed</option>
        </select>
      </div>
      <div className="col-auto">
        <input className="form-control" type="number" step="0.01" placeholder="Value" value={form.value}
          onChange={(e) => setForm({ ...form, value: e.target.value })} required />
      </div>
      <div className="col-auto">
        <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
          <option value="active">Activo</option>
          <option value="paused">Pausado</option>
        </select>
      </div>
      <div className="col-auto">
        <input type="date" className="form-control" placeholder="Desde" value={form.validFrom}
          onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
      </div>
      <div className="col-auto">
        <input type="date" className="form-control" placeholder="Hasta" value={form.validTo}
          onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
      </div>
      <div className="col-auto">
        <input className="form-control" type="number" step="0.01" placeholder="Min subtotal" value={form.minSubtotal}
          onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })} />
      </div>
      <div className="col-auto">
        <input className="form-control" type="number" step="1" placeholder="Max usos" value={form.maxUses}
          onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
      </div>
      <div className="col-auto">
        <input className="form-control" type="number" step="1" placeholder="Límite por usuario" value={form.perUserLimit}
          onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} />
      </div>
      <div className="col-auto form-check d-flex align-items-center ms-2">
        <input id="stackableCheck" className="form-check-input" type="checkbox" checked={!!form.stackable}
          onChange={(e) => setForm({ ...form, stackable: e.target.checked })} />
        <label htmlFor="stackableCheck" className="form-check-label ms-1">Acumulable</label>
      </div>
      <div className="col-12">
        <input list={themeListId} className="form-control" placeholder="Temas permitidos (separa con coma)" value={form.allowedThemes}
          onChange={(e) => setForm({ ...form, allowedThemes: e.target.value })} />
        <datalist id={themeListId}>
          {categories.map((c) => <option key={c} value={c} />)}
        </datalist>
      </div>
      <div className="col-12">
        <input className="form-control" placeholder="Productos bloqueados (IDs o códigos, coma)" value={form.disallowProducts}
          onChange={(e) => setForm({ ...form, disallowProducts: e.target.value })} />
      </div>
      <div className="col-12">
        <button className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando…' : 'Guardar'}
        </button>
      </div>
    </form>
  );
}

export default function CouponsPage() {
  const [list, setList] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(null);
  const [usages, setUsages] = useState({ openFor: null, items: [] });
  const [filters, setFilters] = useState({ q: '', status: '', from: '', to: '' });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const load = async (override = {}) => {
    setLoading(true);
    const params = { page, pageSize, ...filters, ...override };
    const data = (await api.adminListCoupons(params)) || {};
    setList(data.items || []);
    setTotal(data.total || 0);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [page, pageSize]);

  const applyFilters = async () => {
    setPage(1);
    await load({ page: 1 });
  };

  const buildPayload = (form) => {
    const toArray = (val) => Array.isArray(val)
      ? val
      : (typeof val === 'string' ? val.split(',').map((s) => s.trim()).filter(Boolean) : []);
    const num = (v) => (v === '' || v === undefined || v === null ? undefined : Number(v));
    const out = {
      code: (form.code || '').toString().toUpperCase().trim(),
      type: String(form.type || 'percent'),
      value: num(form.value),
      status: String(form.status || 'active'),
      stackable: !!form.stackable,
    };
    if (form.validFrom) out.validFrom = form.validFrom; // yyyy-mm-dd
    if (form.validTo) out.validTo = form.validTo;
    const minSubtotal = num(form.minSubtotal);
    if (minSubtotal !== undefined) out.minSubtotal = minSubtotal;
    const maxUses = num(form.maxUses);
    if (maxUses !== undefined) out.maxUses = maxUses;
    const perUserLimit = num(form.perUserLimit);
    if (perUserLimit !== undefined) out.perUserLimit = perUserLimit;
    const allowedThemes = toArray(form.allowedThemes);
    if (allowedThemes.length) out.allowedThemes = allowedThemes;
    const disallowProducts = toArray(form.disallowProducts);
    if (disallowProducts.length) out.disallowProducts = disallowProducts;
    return out;
  };

  const handleCreate = async (form) => {
    setCreating(true);
    const payload = buildPayload(form);
    await api.adminCreateCoupon(payload);
    setCreating(false);
    await load();
  };

  const handleUpdate = async (id, form) => {
    await api.adminUpdateCoupon(id, buildPayload(form));
    setEditing(null);
    await load();
  };

  const toggleUsages = async (coupon) => {
    if (usages.openFor === coupon.id) {
      setUsages({ openFor: null, items: [] });
      return;
    }
    const res = await api.adminListCouponUsages(coupon.id, { page: 1, pageSize: 50 });
    setUsages({ openFor: coupon.id, items: res.items || [] });
  };

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    if (typeof api.getCategories === 'function') {
      Promise.resolve(api.getCategories())
        .then((cats) => setCategories((cats || []).map((c) => c.name)))
        .catch(() => {});
    }
  }, []);

  return (
    <AdminLayout>
      <div>
        <h2 className="mb-3">Cupones</h2>
        <div className="mb-3 d-flex gap-2 align-items-end">
          <div>
            <label className="form-label">Buscar</label>
            <input
              aria-label="Buscar cupones"
              className="form-control"
              placeholder="Código"
              value={filters.q}
              onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            />
          </div>
          <div>
            <label className="form-label">Estado</label>
            <select
              aria-label="Estado"
              className="form-select"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Todos</option>
              <option value="active">Activo</option>
              <option value="paused">Pausado</option>
            </select>
          </div>
          <div>
            <label className="form-label">Desde</label>
            <input type="date" className="form-control" value={filters.from}
              onChange={(e) => setFilters({ ...filters, from: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Hasta</label>
            <input type="date" className="form-control" value={filters.to}
              onChange={(e) => setFilters({ ...filters, to: e.target.value })} />
          </div>
          <button className="btn btn-outline-primary" onClick={applyFilters}>Buscar</button>
          <button
            className="btn btn-outline-secondary"
            onClick={() => {
              setFilters({ q: '', status: '', from: '', to: '' });
              setPage(1);
              load({ q: '', status: '', from: '', to: '', page: 1 });
            }}
          >
            Limpiar
          </button>
        </div>
        <div className="mb-4">
          <h5>Crear cupón</h5>
          <CouponForm onSubmit={handleCreate} submitting={creating} categories={categories} />
        </div>
        {loading ? (
          <p>Cargando…</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Estado</th>
                <th>Usos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id}>
                  <td>{c.code}</td>
                  <td>{c.type}</td>
                  <td>{parseFloat(c.value).toFixed(2)}</td>
                  <td>{c.status}</td>
                  <td>{c.usageCount || 0}</td>
                  <td className="d-flex gap-2">
                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(c)}>Editar</button>
                    <button className="btn btn-sm btn-outline-primary" onClick={() => toggleUsages(c)}>
                      {usages.openFor === c.id ? 'Ocultar usos' : 'Ver usos'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        <div className="d-flex align-items-center justify-content-between mt-2">
          <div className="d-flex align-items-center gap-2">
            <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>Anterior</button>
            <span>Página {page} de {Math.max(1, Math.ceil((total || 0) / pageSize))}</span>
            <button className="btn btn-outline-secondary btn-sm" disabled={page >= Math.ceil((total || 0) / pageSize)} onClick={() => setPage((p) => p + 1)}>Siguiente</button>
          </div>
          <div>
            <label className="me-2">Por página</label>
            <select className="form-select d-inline-block" style={{ width: 90 }} value={pageSize} onChange={(e) => { setPageSize(parseInt(e.target.value, 10) || 20); setPage(1); }}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
        {editing && (
          <div className="mt-4">
            <h5>Editar {editing.code}</h5>
            <CouponForm categories={categories} initial={{
              ...editing,
              allowedThemes: Array.isArray(editing.allowedThemes) ? editing.allowedThemes.join(',') : '',
              disallowProducts: Array.isArray(editing.disallowProducts) ? editing.disallowProducts.join(',') : '',
            }} onSubmit={(f) => handleUpdate(editing.id, f)} />
            <button className="btn btn-link mt-2" onClick={() => setEditing(null)}>Cancelar</button>
          </div>
        )}
        {usages.openFor && (
          <div className="mt-4">
            <h5>Usos de {list.find((x) => x.id === usages.openFor)?.code}</h5>
            <table className="table">
              <thead>
                <tr>
                  <th>Usuario</th>
                  <th>Orden</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {usages.items.map((u) => (
                  <tr key={u.id}>
                    <td>{u.User?.name || u.userId}</td>
                    <td>#{u.orderId}</td>
                    <td>{new Date(u.usedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
