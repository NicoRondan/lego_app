import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import InfoTooltip from '../../components/InfoTooltip.jsx';
import * as api from '../../services/api';

function SegmentsPage() {
  const [segments, setSegments] = useState([]);
  const [form, setForm] = useState({ name: '', theme: '', minAov: '', lastOrderDaysLt: '', hasWishlist: true });
  const [previewSize, setPreviewSize] = useState(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const list = await api.adminListSegments();
    setSegments(list);
  }, []);

  useEffect(() => { load(); }, [load]);

  const buildDefinition = () => {
    const def = {};
    if (form.theme.trim()) def.theme = form.theme.split(',').map((s) => s.trim()).filter(Boolean);
    if (form.minAov) def.minAov = Number(form.minAov);
    if (form.lastOrderDaysLt) def.lastOrderDaysLt = Number(form.lastOrderDaysLt);
    if (form.hasWishlist != null) def.hasWishlist = Boolean(form.hasWishlist);
    return def;
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Segmentos"
        subtitle={(<>
          Agrupa clientes según reglas simples (tema, AOV, actividad y wishlist) para usarlos en campañas. Puedes previsualizar el tamaño antes de guardar el segmento.
        </>)}
      />
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Nuevo segmento</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre <InfoTooltip text="Usa un nombre descriptivo, p. ej. 'Fans SW alto gasto'" /></label>
              <input className="form-control" placeholder="Ej: Fans SW alto gasto" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Temas (coma-separados) <InfoTooltip text="Filtra por categorías/temas de productos comprados o en wishlist. Coincidirá si el usuario tiene al menos un ítem de alguno de estos temas." /></label>
              <input className="form-control" placeholder="Ej: Star Wars, Technic" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">AOV mínimo <InfoTooltip text="Ticket promedio mínimo (Average Order Value) del cliente." /></label>
              <input type="number" className="form-control" placeholder="Ej: 100" value={form.minAov} onChange={(e) => setForm({ ...form, minAov: e.target.value })} />
            </div>
            <div className="col-md-2">
              <label className="form-label">Últ. compra &lt; días <InfoTooltip text="Clientes cuya última compra fue hace menos de N días." /></label>
              <input type="number" className="form-control" placeholder="Ej: 90" value={form.lastOrderDaysLt} onChange={(e) => setForm({ ...form, lastOrderDaysLt: e.target.value })} />
            </div>
            <div className="col-12">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" id="hasWishlist" checked={!!form.hasWishlist} onChange={(e) => setForm({ ...form, hasWishlist: e.target.checked })} />
                <label className="form-check-label" htmlFor="hasWishlist">Debe tener wishlist <InfoTooltip text="Incluye solo clientes que tengan una wishlist con al menos un producto." /></label>
              </div>
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-outline-primary" disabled={loading} onClick={async () => {
                setLoading(true);
                try {
                  const resp = await api.adminCreateSegment({ name: form.name || 'preview', definition: buildDefinition(), preview: true });
                  setPreviewSize(resp.size || 0);
                } finally { setLoading(false); }
              }}>Previsualizar tamaño</button>
              <button className="btn btn-primary" disabled={loading || !form.name} onClick={async () => {
                setLoading(true);
                try {
                  await api.adminCreateSegment({ name: form.name, definition: buildDefinition() });
                  setForm({ name: '', theme: '', minAov: '', lastOrderDaysLt: '', hasWishlist: true });
                  setPreviewSize(null);
                  await load();
                } finally { setLoading(false); }
              }}>Guardar segmento</button>
              {previewSize != null && (
                <div className="ms-3 align-self-center">Tamaño estimado: <strong>{previewSize}</strong></div>
              )}
            </div>
          </div>
        </div>
      </div>

      <h5>Segmentos existentes</h5>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Tamaño</th><th>Definición</th></tr>
          </thead>
          <tbody>
            {segments.map((s) => (
              <tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.size}</td><td><code>{JSON.stringify(s.definition)}</code></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default SegmentsPage;
