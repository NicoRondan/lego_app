import React, { useEffect, useState } from 'react';
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
      <td>{banner?.id || '-'}</td>
      <td><input className="form-control form-control-sm" value={form.title || ''} onChange={(e) => setForm({ ...form, title: e.target.value })} /></td>
      <td><input className="form-control form-control-sm" value={form.imageUrl || ''} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} /></td>
      <td><input className="form-control form-control-sm" value={form.linkUrl || ''} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} /></td>
      <td>
        <select className="form-select form-select-sm" value={form.placement || 'home-hero'} onChange={(e) => setForm({ ...form, placement: e.target.value })}>
          <option value="home-hero">Home Hero</option>
          <option value="rail">Rail</option>
          <option value="sidebar">Sidebar</option>
        </select>
      </td>
      <td>
        <input type="datetime-local" className="form-control form-control-sm" value={form.startsAt ? String(form.startsAt).slice(0,16) : ''} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
      </td>
      <td>
        <input type="datetime-local" className="form-control form-control-sm" value={form.endsAt ? String(form.endsAt).slice(0,16) : ''} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
      </td>
      <td>
        <input type="checkbox" className="form-check-input" checked={!!form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
      </td>
      <td>
        <button className="btn btn-sm btn-primary" onClick={save}>Guardar</button>
      </td>
    </tr>
  );
}

function BannersPage() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setBanners(await api.adminListBanners()); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <h1>Banners</h1>
      <p className="text-muted">Gestioná los banners con fechas y placement.</p>

      <div className="table-responsive">
        <table className="table table-striped table-sm align-middle">
          <thead>
            <tr><th>ID</th><th>Título</th><th>Imagen URL</th><th>Link URL</th><th>Placement</th><th>Inicio</th><th>Fin</th><th>Activo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            {creating && (
              <EditRow banner={{}} onSave={async (data) => { await api.adminCreateBanner(data); setCreating(false); await load(); }} />
            )}
            {banners.map((b) => (
              <EditRow key={b.id} banner={b} onSave={async () => { await load(); }} />
            ))}
          </tbody>
        </table>
      </div>
      <button className="btn btn-outline-primary" onClick={() => setCreating(true)}>+ Nuevo banner</button>
    </AdminLayout>
  );
}

export default BannersPage;

