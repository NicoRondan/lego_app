import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import * as api from '../../services/api';
import BrickModal from '../../components/lego/BrickModal';

function EditRow({ banner, onSave }) {
  const [form, setForm] = useState({ ...banner });
  const [err, setErr] = useState({});
  const validate = (f) => {
    const e = {};
    if (!String(f.title || '').trim()) e.title = 'Requerido';
    const img = String(f.imageUrl || '').trim();
    if (!img) e.imageUrl = 'Requerido';
    else if (!/^https?:\/\//i.test(img) && !/^data:/i.test(img)) e.imageUrl = 'URL inválida';
    if (f.startsAt && f.endsAt && new Date(f.startsAt) > new Date(f.endsAt)) e.endsAt = 'Fin < Inicio';
    if (!['home-hero','rail','sidebar'].includes(f.placement)) e.placement = 'Placement inválido';
    return e;
  };
  const save = async () => {
    const e = validate(form);
    setErr(e);
    if (Object.keys(e).length) return;
    const data = { title: form.title, imageUrl: form.imageUrl, linkUrl: form.linkUrl, placement: form.placement, isActive: !!form.isActive, startsAt: form.startsAt, endsAt: form.endsAt };
    if (banner?.id) await api.adminUpdateBanner(banner.id, data); else await onSave(data);
  };
  return (
    <tr>
      <td className="text-muted" style={{ width: 60 }}>{banner?.id || '-'}</td>
      <td style={{ minWidth: 260 }}>
        <div className="d-flex align-items-center gap-2">
          {form.imageUrl ? (
            <img src={form.imageUrl} alt="preview" style={{ width: 64, height: 32, objectFit: 'cover', borderRadius: 4 }} />
          ) : (
            <div style={{ width: 64, height: 32, background: '#eee', borderRadius: 4 }} />
          )}
          <input className={`form-control ${err.title ? 'is-invalid' : ''}`} value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
      </td>
      <td style={{ minWidth: 320 }}><input className={`form-control ${err.imageUrl ? 'is-invalid' : ''}`} placeholder="https://..." value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></td>
      <td style={{ minWidth: 220 }}><input className="form-control" placeholder="/ruta" value={form.linkUrl || ''} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} /></td>
      <td style={{ width: 160 }}>
        <select className={`form-select ${err.placement ? 'is-invalid' : ''}`} value={form.placement || 'home-hero'} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
          <option value="home-hero">Home Hero</option>
          <option value="rail">Rail</option>
          <option value="sidebar">Sidebar</option>
        </select>
      </td>
      <td style={{ minWidth: 220 }}>
        <input type="datetime-local" className="form-control" value={form.startsAt ? String(form.startsAt).slice(0,16) : ''} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
      </td>
      <td style={{ minWidth: 220 }}>
        <input type="datetime-local" className={`form-control ${err.endsAt ? 'is-invalid' : ''}`} value={form.endsAt ? String(form.endsAt).slice(0,16) : ''} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
      </td>
      <td className="text-center">
        <input type="checkbox" className="form-check-input" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
      </td>
      <td style={{ width: 140 }}>
        <button className="btn btn-primary" onClick={save}>Guardar</button>
      </td>
    </tr>
  );
}

function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', imageUrl: '', linkUrl: '', placement: 'home-hero', isActive: true, startsAt: '', endsAt: '' });
  const [errors, setErrors] = useState({});

  const validate = (f) => {
    const e = {};
    if (!String(f.title || '').trim()) e.title = 'El título es obligatorio';
    const img = String(f.imageUrl || '').trim();
    if (!img) e.imageUrl = 'La imagen es obligatoria';
    else if (!/^https?:\/\//i.test(img) && !/^data:/i.test(img)) e.imageUrl = 'Debe ser una URL válida (http/https)';
    if (f.startsAt && f.endsAt && new Date(f.startsAt) > new Date(f.endsAt)) e.endsAt = 'Fin debe ser posterior o igual a Inicio';
    if (!['home-hero','rail','sidebar'].includes(f.placement)) e.placement = 'Placement inválido';
    return e;
  };
  const [q, setQ] = useState('');
  const [placement, setPlacement] = useState('');

  const load = async () => {
    setLoading(true);
    try { setBanners(await api.adminListBanners()); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => {
    return (banners || []).filter(b =>
      (!q || (b.title || '').toLowerCase().includes(q.toLowerCase())) &&
      (!placement || b.placement === placement)
    );
  }, [banners, q, placement]);

  return (
    <AdminLayout>
      <h1>Banners</h1>
      <p className="text-muted">Gestioná los banners con fechas y placement.</p>

      <div className="d-flex gap-2 align-items-end mb-3">
        <div style={{ maxWidth: 320 }}>
          <label className="form-label">Buscar</label>
          <input className="form-control" placeholder="Título contiene…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div style={{ maxWidth: 200 }}>
          <label className="form-label">Placement</label>
          <select className="form-select" value={placement} onChange={(e) => setPlacement(e.target.value)}>
            <option value="">Todos</option>
            <option value="home-hero">Home Hero</option>
            <option value="rail">Rail</option>
            <option value="sidebar">Sidebar</option>
          </select>
        </div>
        <button className="btn btn-outline-primary ms-auto" onClick={() => { setCreating(true); setCreateForm({ title: '', imageUrl: '', linkUrl: '', placement: 'home-hero', isActive: true, startsAt: '', endsAt: '' }); setErrors({}); }}>+ Nuevo banner</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr><th className="text-muted">ID</th><th>Título</th><th>Imagen</th><th>Link</th><th>Placement</th><th>Inicio</th><th>Fin</th><th className="text-center">Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <EditRow key={b.id} banner={b} onSave={async () => { await load(); }} />
            ))}
          </tbody>
        </table>
      </div>
      <BrickModal id="bannerCreateModal" title="Nuevo banner" open={creating} onClose={() => setCreating(false)} size="lg">
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Título</label>
            <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} value={createForm.title} onChange={(e) => { const v = e.target.value; setCreateForm({ ...createForm, title: v }); setErrors((prev) => ({ ...prev, title: undefined })); }} />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>
          <div className="col-md-7">
            <label className="form-label">Imagen (URL)</label>
            <input className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`} placeholder="https://…" value={createForm.imageUrl} onChange={(e) => { const v = e.target.value; setCreateForm({ ...createForm, imageUrl: v }); setErrors((prev) => ({ ...prev, imageUrl: undefined })); }} />
            {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
          </div>
          <div className="col-md-5 d-flex align-items-end">
            {createForm.imageUrl ? (
              <img src={createForm.imageUrl} alt="preview" className="img-fluid rounded" style={{ maxHeight: 80, objectFit: 'cover' }} />
            ) : (
              <div className="w-100" style={{ height: 80, background: '#eee', borderRadius: 6 }} />
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">Link</label>
            <input className="form-control" placeholder="/ruta" value={createForm.linkUrl} onChange={(e) => setCreateForm({ ...createForm, linkUrl: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Placement</label>
            <select className={`form-select ${errors.placement ? 'is-invalid' : ''}`} value={createForm.placement} onChange={(e) => { setCreateForm({ ...createForm, placement: e.target.value }); setErrors((prev) => ({ ...prev, placement: undefined })); }}>
              <option value="home-hero">Home Hero</option>
              <option value="rail">Rail</option>
              <option value="sidebar">Sidebar</option>
            </select>
            {errors.placement && <div className="invalid-feedback">{errors.placement}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Inicio</label>
            <input type="datetime-local" className="form-control" value={createForm.startsAt} onChange={(e) => setCreateForm({ ...createForm, startsAt: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Fin</label>
            <input type="datetime-local" className={`form-control ${errors.endsAt ? 'is-invalid' : ''}`} value={createForm.endsAt} onChange={(e) => { const v = e.target.value; setCreateForm({ ...createForm, endsAt: v }); setErrors((prev) => ({ ...prev, endsAt: undefined })); }} />
            {errors.endsAt && <div className="invalid-feedback">{errors.endsAt}</div>}
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="newBannerActive" checked={!!createForm.isActive} onChange={(e) => setCreateForm({ ...createForm, isActive: e.target.checked })} />
              <label className="form-check-label" htmlFor="newBannerActive">Activo</label>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-outline-secondary" onClick={() => setCreating(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={async () => {
            const e = validate(createForm);
            setErrors(e);
            if (Object.keys(e).length) return;
            await api.adminCreateBanner(createForm);
            setCreating(false);
            await load();
          }}>Crear</button>
        </div>
      </BrickModal>
    </AdminLayout>
  );
}

export default BannersPage;
