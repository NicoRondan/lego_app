import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import * as api from '../../services/api';
import BrickModal from '../../components/lego/BrickModal';

function DisplayRow({ banner, onEdit }) {
  return (
    <tr>
      <td className="text-muted" style={{ width: 60 }}>{banner?.id || '-'}</td>
      <td style={{ minWidth: 260 }}>
        <div className="d-flex align-items-center gap-2">
          {banner.imageUrl ? (
            <img src={banner.imageUrl} alt="preview" style={{ width: 64, height: 32, objectFit: 'cover', borderRadius: 4 }} />
          ) : (
            <div style={{ width: 64, height: 32, background: '#eee', borderRadius: 4 }} />
          )}
          <span className="text-truncate" title={banner.title} style={{ maxWidth: 320 }}>{banner.title}</span>
        </div>
      </td>
      <td style={{ minWidth: 320 }}>
        <span className="text-truncate d-inline-block" style={{ maxWidth: 360 }} title={banner.imageUrl}>{banner.imageUrl}</span>
      </td>
      <td style={{ minWidth: 220 }}>
        <span className="text-truncate d-inline-block" style={{ maxWidth: 240 }} title={banner.linkUrl}>{banner.linkUrl || '-'}</span>
      </td>
      <td style={{ width: 160 }}>
        <span className="badge bg-secondary">{banner.placement}</span>
      </td>
      <td style={{ minWidth: 220 }}>
        {banner.startsAt ? new Date(banner.startsAt).toLocaleString() : '-'}
      </td>
      <td style={{ minWidth: 220 }}>
        {banner.endsAt ? new Date(banner.endsAt).toLocaleString() : '-'}
      </td>
      <td className="text-center">
        <input type="checkbox" className="form-check-input" checked={!!banner.isActive} readOnly />
      </td>
      <td style={{ width: 160 }}>
        <button className="btn btn-outline-secondary me-2" onClick={() => onEdit(banner)}>Editar</button>
      </td>
    </tr>
  );
}

function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [form, setForm] = useState({ title: '', imageUrl: '', linkUrl: '', placement: 'home-hero', isActive: true, startsAt: '', endsAt: '' });
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
      <h2>Banners</h2>
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
        <button className="btn btn-outline-primary ms-auto" onClick={() => { setModalOpen(true); setEditingBanner(null); setForm({ title: '', imageUrl: '', linkUrl: '', placement: 'home-hero', isActive: true, startsAt: '', endsAt: '' }); setErrors({}); }}>+ Nuevo banner</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr><th className="text-muted">ID</th><th>Título</th><th>Imagen</th><th>Link</th><th>Placement</th><th>Inicio</th><th>Fin</th><th className="text-center">Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <DisplayRow key={b.id} banner={b} onEdit={(ban) => { setEditingBanner(ban); setForm({
                title: ban.title || '', imageUrl: ban.imageUrl || '', linkUrl: ban.linkUrl || '', placement: ban.placement || 'home-hero', isActive: !!ban.isActive,
                startsAt: ban.startsAt ? String(ban.startsAt).slice(0,16) : '', endsAt: ban.endsAt ? String(ban.endsAt).slice(0,16) : ''
              }); setErrors({}); setModalOpen(true); }} />
            ))}
          </tbody>
        </table>
      </div>
      <BrickModal id="bannerCreateModal" title={editingBanner ? 'Editar banner' : 'Nuevo banner'} open={modalOpen} onClose={() => setModalOpen(false)} size="lg">
        <div className="row g-3">
          <div className="col-12">
            <label className="form-label">Título</label>
            <input className={`form-control ${errors.title ? 'is-invalid' : ''}`} placeholder="Ej: Promo lateral de primavera" value={form.title} onChange={(e) => { const v = e.target.value; setForm({ ...form, title: v }); setErrors((prev) => ({ ...prev, title: undefined })); }} />
            {errors.title && <div className="invalid-feedback">{errors.title}</div>}
          </div>
          <div className="col-md-7">
            <label className="form-label">Imagen (URL)</label>
            <input className={`form-control ${errors.imageUrl ? 'is-invalid' : ''}`} placeholder="https://example.com/banner.jpg" title="Usá una imagen horizontal. 1200x420 recomendado" value={form.imageUrl} onChange={(e) => { const v = e.target.value; setForm({ ...form, imageUrl: v }); setErrors((prev) => ({ ...prev, imageUrl: undefined })); }} />
            {errors.imageUrl && <div className="invalid-feedback">{errors.imageUrl}</div>}
          </div>
          <div className="col-md-5 d-flex align-items-end">
            {form.imageUrl ? (
              <img src={form.imageUrl} alt="preview" className="img-fluid rounded" style={{ maxHeight: 80, objectFit: 'cover' }} />
            ) : (
              <div className="w-100" style={{ height: 80, background: '#eee', borderRadius: 6 }} />
            )}
          </div>
          <div className="col-md-6">
            <label className="form-label">Link</label>
            <input className="form-control" placeholder="/products?order=createdAt_desc" title="Ruta interna o URL absoluta" value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Placement</label>
            <select className={`form-select ${errors.placement ? 'is-invalid' : ''}`} value={form.placement} onChange={(e) => { setForm({ ...form, placement: e.target.value }); setErrors((prev) => ({ ...prev, placement: undefined })); }}>
              <option value="home-hero">Home Hero</option>
              <option value="rail">Rail</option>
              <option value="sidebar">Sidebar</option>
            </select>
            {errors.placement && <div className="invalid-feedback">{errors.placement}</div>}
          </div>
          <div className="col-md-6">
            <label className="form-label">Inicio</label>
            <input type="datetime-local" className="form-control" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          </div>
          <div className="col-md-6">
            <label className="form-label">Fin</label>
            <input type="datetime-local" className={`form-control ${errors.endsAt ? 'is-invalid' : ''}`} value={form.endsAt} onChange={(e) => { const v = e.target.value; setForm({ ...form, endsAt: v }); setErrors((prev) => ({ ...prev, endsAt: undefined })); }} />
            {errors.endsAt && <div className="invalid-feedback">{errors.endsAt}</div>}
          </div>
          <div className="col-12">
            <div className="form-check">
              <input className="form-check-input" type="checkbox" id="newBannerActive" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
              <label className="form-check-label" htmlFor="newBannerActive">Activo</label>
            </div>
          </div>
        </div>
        <div className="d-flex justify-content-end gap-2 mt-3">
          <button className="btn btn-outline-secondary" onClick={() => setModalOpen(false)}>Cancelar</button>
          <button className="btn btn-primary" onClick={async () => {
            const e = validate(form);
            setErrors(e);
            if (Object.keys(e).length) return;
            if (editingBanner) {
              await api.adminUpdateBanner(editingBanner.id, form);
            } else {
              await api.adminCreateBanner(form);
            }
            setModalOpen(false);
            await load();
          }}>{editingBanner ? 'Guardar' : 'Crear'}</button>
        </div>
      </BrickModal>
    </AdminLayout>
  );
}

export default BannersPage;
