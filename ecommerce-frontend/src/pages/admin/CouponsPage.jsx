import React, { useEffect, useMemo, useState } from 'react';
import * as api from '../../services/api';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import BrickModal from '../../components/lego/BrickModal.jsx';
import InfoTooltip from '../../components/InfoTooltip.jsx';

function toYMD(v) {
  if (!v) return '';
  try {
    const d = new Date(v);
    if (!Number.isNaN(d.getTime())) return d.toISOString().slice(0, 10);
  } catch {}
  const s = String(v);
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  return s.slice(0, 10);
}

function normalizeInitial(i = {}) {
  const toStr = (v) => (v === null || v === undefined ? '' : v);
  return {
    code: toStr(i.code || ''),
    type: toStr(i.type || 'percent'),
    value: toStr(i.value ?? 10),
    status: toStr(i.status || 'active'),
    validFrom: toYMD(i.validFrom || ''),
    validTo: toYMD(i.validTo || ''),
    minSubtotal: toStr(i.minSubtotal ?? ''),
    maxUses: toStr(i.maxUses ?? ''),
    perUserLimit: toStr(i.perUserLimit ?? ''),
    allowedThemes: Array.isArray(i.allowedThemes)
      ? i.allowedThemes
      : (typeof i.allowedThemes === 'string' ? i.allowedThemes.split(',').map((s) => s.trim()).filter(Boolean) : []),
    disallowProducts: toStr(Array.isArray(i.disallowProducts) ? i.disallowProducts.join(',') : i.disallowProducts || ''),
    stackable: !!i.stackable,
  };
}

function CouponForm({ initial = {}, onSubmit, submitting, categories = [] }) {
  const [form, setForm] = useState(() => normalizeInitial(initial));
  // Normalizar allowedThemes si viene como string
  useEffect(() => {
    // Ensure no null values on mount
    setForm((f) => ({ ...normalizeInitial(initial), ...f }));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [errors, setErrors] = useState({});
  const validate = (f) => {
    const e = {};
    const n = (v) => (v === '' || v === undefined || v === null ? undefined : Number(v));
    if (n(f.value) !== undefined && Number(f.value) < 0) e.value = 'El valor debe ser >= 0';
    if (n(f.minSubtotal) !== undefined && Number(f.minSubtotal) < 0) e.minSubtotal = 'Debe ser >= 0';
    if (n(f.maxUses) !== undefined && Number(f.maxUses) < 0) e.maxUses = 'Debe ser >= 0';
    if (n(f.perUserLimit) !== undefined && Number(f.perUserLimit) < 0) e.perUserLimit = 'Debe ser >= 0';
    return e;
  };
  useEffect(() => {
    setErrors(validate(form));
  }, [form]);
  const themeListId = useMemo(() => 'themes-list', []);

  // Chips para allowedThemes
  const [themeInput, setThemeInput] = useState('');
  const addTheme = (raw) => {
    const v = String(raw || themeInput).trim();
    if (!v) return;
    if (form.allowedThemes.includes(v)) { setThemeInput(''); return; }
    setForm({ ...form, allowedThemes: [...form.allowedThemes, v] });
    setThemeInput('');
  };
  const removeTheme = (t) => setForm({ ...form, allowedThemes: form.allowedThemes.filter((x) => x !== t) });
  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(form); }}>
      <div className="row g-3">
        <div className="col-md-3">
          <label className="form-label">Código</label>
          <input className="form-control" placeholder="CODE" value={form.code || ''}
            onChange={(e) => setForm({ ...form, code: e.target.value })} required />
        </div>
        <div className="col-md-2">
          <label className="form-label">Tipo</label>
          <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
            <option value="percent">Percent</option>
            <option value="fixed">Fixed</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Valor <InfoTooltip text="Porcentaje (0-100) si es percent, o monto fijo si es fixed" /></label>
          <input className="form-control" type="number" step="0.01" placeholder="Valor" value={form.value ?? ''}
            onChange={(e) => setForm({ ...form, value: e.target.value })} required />
          {errors.value && <div className="text-danger small">{errors.value}</div>}
        </div>
        <div className="col-md-2">
          <label className="form-label">Estado</label>
          <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option value="active">Activo</option>
            <option value="paused">Pausado</option>
          </select>
        </div>
        <div className="col-md-2">
          <label className="form-label">Desde</label>
          <input type="date" className="form-control" value={form.validFrom || ''}
            onChange={(e) => setForm({ ...form, validFrom: e.target.value })} />
        </div>
        <div className="col-md-2">
          <label className="form-label">Hasta</label>
          <input type="date" className="form-control" value={form.validTo || ''}
            onChange={(e) => setForm({ ...form, validTo: e.target.value })} />
        </div>
        <div className="col-md-3">
          <label className="form-label">Min subtotal <InfoTooltip text="Monto mínimo del carrito para aplicar" /></label>
          <input className="form-control" type="number" step="0.01" placeholder="Min subtotal" value={form.minSubtotal ?? ''}
            onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })} />
          {errors.minSubtotal && <div className="text-danger small">{errors.minSubtotal}</div>}
        </div>
        <div className="col-md-2">
          <label className="form-label">Max usos <InfoTooltip text="Cantidad total de usos del cupón" /></label>
          <input className="form-control" type="number" step="1" placeholder="Max usos" value={form.maxUses ?? ''}
            onChange={(e) => setForm({ ...form, maxUses: e.target.value })} />
          {errors.maxUses && <div className="text-danger small">{errors.maxUses}</div>}
        </div>
        <div className="col-md-3">
          <label className="form-label">Límite por usuario <InfoTooltip text="Usos permitidos por usuario" /></label>
          <input className="form-control" type="number" step="1" placeholder="Límite por usuario" value={form.perUserLimit ?? ''}
            onChange={(e) => setForm({ ...form, perUserLimit: e.target.value })} />
          {errors.perUserLimit && <div className="text-danger small">{errors.perUserLimit}</div>}
        </div>
        <div className="col-md-2 d-flex align-items-center">
          <div className="form-check mt-4">
            <input id="stackableCheck" className="form-check-input" type="checkbox" checked={!!form.stackable}
              onChange={(e) => setForm({ ...form, stackable: e.target.checked })} />
            <label htmlFor="stackableCheck" className="form-check-label ms-1">Acumulable</label>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label">Temas permitidos <InfoTooltip text="Al menos un item del carrito debe pertenecer a alguno de estos temas" /></label>
          <div className="form-control p-2">
            <div className="mb-2">
              {form.allowedThemes.map((t) => (
                <span key={t} className="badge rounded-pill bg-primary text-white me-2 d-inline-flex align-items-center">
                  {t}
                  <button type="button" className="btn-close btn-close-white ms-2" aria-label={`Quitar ${t}`} style={{ transform: 'scale(0.8)' }} onClick={() => removeTheme(t)} />
                </span>
              ))}
            </div>
            <input
              list={themeListId}
              className="form-control border-0"
              placeholder="Agregar tema y presiona Enter"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTheme(); } }}
              onBlur={() => addTheme()}
            />
            <datalist id={themeListId}>
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>
        </div>

        <div className="col-12">
          <label className="form-label">Productos bloqueados</label>
          <input className="form-control" placeholder="IDs o códigos, separados por coma" value={form.disallowProducts || ''}
            onChange={(e) => setForm({ ...form, disallowProducts: e.target.value })} />
        </div>

        <div className="col-12">
          <button className="btn btn-primary" disabled={submitting || Object.keys(errors).length > 0}>
            {submitting ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
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
  const [sort, setSort] = useState({ field: 'code', dir: 'asc' });

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
    const el = document.getElementById('couponUsagesModal');
    if (window.bootstrap && el) {
      window.bootstrap.Modal.getOrCreateInstance(el).show();
    }
  };

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    if (typeof api.getCategories === 'function') {
      Promise.resolve(api.getCategories())
        .then((cats) => setCategories((cats || []).map((c) => c.name)))
        .catch(() => {});
    }
  }, []);

  // Tabs UI similar a NewProductPage
  const [activeTab, setActiveTab] = useState('crear');

  // Modal helpers
  const [editOpen, setEditOpen] = useState(false);
  const openEditModal = (coupon) => {
    setEditing(coupon);
    setEditOpen(true);
  };
  const closeEditModal = () => setEditOpen(false);

  return (
    <AdminLayout>
      <div>
        <h2 className="mb-3">Cupones</h2>
        <ul className="nav nav-tabs mb-3">
          <li className="nav-item">
            <button type="button" className={`nav-link ${activeTab === 'crear' ? 'active' : ''}`} onClick={() => setActiveTab('crear')}>Crear</button>
          </li>
          <li className="nav-item">
            <button type="button" className={`nav-link ${activeTab === 'listar' ? 'active' : ''}`} onClick={() => setActiveTab('listar')}>Listado</button>
          </li>
        </ul>
        <div className="tab-content">
          <div className={`tab-pane fade ${activeTab === 'crear' ? 'show active' : ''}`}>
            <div className="mb-4">
              <h5>Crear cupón</h5>
              <CouponForm onSubmit={handleCreate} submitting={creating} categories={categories} />
            </div>
          </div>
          <div className={`tab-pane fade ${activeTab === 'listar' ? 'show active' : ''}`}>
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
            {loading ? (
              <p>Cargando…</p>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th role="button" onClick={() => setSort((s) => ({ field: 'code', dir: s.field==='code'&&s.dir==='asc'?'desc':'asc' }))}>Código</th>
                    <th role="button" onClick={() => setSort((s) => ({ field: 'type', dir: s.field==='type'&&s.dir==='asc'?'desc':'asc' }))}>Tipo</th>
                    <th role="button" onClick={() => setSort((s) => ({ field: 'value', dir: s.field==='value'&&s.dir==='asc'?'desc':'asc' }))}>Valor</th>
                    <th role="button" onClick={() => setSort((s) => ({ field: 'status', dir: s.field==='status'&&s.dir==='asc'?'desc':'asc' }))}>Estado</th>
                    <th role="button" onClick={() => setSort((s) => ({ field: 'usageCount', dir: s.field==='usageCount'&&s.dir==='asc'?'desc':'asc' }))}>Usos</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {([...list].sort((a,b)=>{
                      const f = sort.field; const dir = sort.dir==='asc'?1:-1;
                      const av = a[f] ?? '';
                      const bv = b[f] ?? '';
                      if (typeof av === 'number' && typeof bv === 'number') return (av-bv)*dir;
                      return String(av).localeCompare(String(bv)) * dir;
                    })).map((c) => (
                    <tr key={c.id}>
                      <td>{c.code}</td>
                      <td>{c.type}</td>
                      <td>{parseFloat(c.value).toFixed(2)}</td>
                      <td>{c.status}</td>
                      <td>{c.usageCount || 0}</td>
                      <td className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => openEditModal(c)}>Editar</button>
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
            <BrickModal id="couponUsagesModal" title={`Usos de ${list.find((x) => x.id === usages.openFor)?.code || ''}`}>
              {usages.items.length === 0 ? (
                <p className="mb-0">Sin usos</p>
              ) : (
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
              )}
            </BrickModal>
          </div>
        </div>
        <BrickModal id="couponEditModal" title={`Editar cupón ${editing?.code || ''}`} open={editOpen} onClose={closeEditModal} size="lg">
          {editing && (
            <CouponForm
              categories={categories}
              initial={{
                ...editing,
                allowedThemes: Array.isArray(editing.allowedThemes)
                  ? editing.allowedThemes
                  : (typeof editing.allowedThemes === 'string'
                    ? editing.allowedThemes.split(',').map((s) => s.trim()).filter(Boolean)
                    : []),
                disallowProducts: Array.isArray(editing.disallowProducts)
                  ? editing.disallowProducts.join(',')
                  : '',
              }}
              onSubmit={async (f) => { await handleUpdate(editing.id, f); closeEditModal(); }}
            />
          )}
        </BrickModal>
      </div>
    </AdminLayout>
  );
}
