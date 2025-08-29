import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import * as api from '../../services/api';

function EditRow({ banner, onSave }) {
  const [form, setForm] = useState({ ...banner });
  const save = async () => {
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
          <input className="form-control" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
      </td>
      <td style={{ minWidth: 320 }}><input className="form-control" placeholder="https://..." value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></td>
      <td style={{ minWidth: 220 }}><input className="form-control" placeholder="/ruta" value={form.linkUrl || ''} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} /></td>
      <td style={{ width: 160 }}>
        <select className="form-select" value={form.placement || 'home-hero'} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
          <option value="home-hero">Home Hero</option>
          <option value="rail">Rail</option>
          <option value="sidebar">Sidebar</option>
        </select>
      </td>
      <td style={{ minWidth: 220 }}>
        <input type="datetime-local" className="form-control" value={form.startsAt ? String(form.startsAt).slice(0,16) : ''} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
      </td>
      <td style={{ minWidth: 220 }}>
        <input type="datetime-local" className="form-control" value={form.endsAt ? String(form.endsAt).slice(0,16) : ''} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
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
        <button className="btn btn-outline-primary ms-auto" onClick={() => setCreating(true)}>+ Nuevo banner</button>
      </div>

      <div className="table-responsive">
        <table className="table table-striped align-middle">
          <thead>
            <tr><th className="text-muted">ID</th><th>Título</th><th>Imagen</th><th>Link</th><th>Placement</th><th>Inicio</th><th>Fin</th><th className="text-center">Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {creating && (
              <EditRow banner={{}} onSave={async (data) => { await api.adminCreateBanner(data); setCreating(false); await load(); }} />
            )}
            {filtered.map((b) => (
              <EditRow key={b.id} banner={b} onSave={async () => { await load(); }} />
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default BannersPage;
