import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import InfoTooltip from '../../components/InfoTooltip.jsx';
import * as api from '../../services/api';

function CampaignsPage() {
  const [segments, setSegments] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [form, setForm] = useState({ name: '', segmentId: '', couponCode: '', startsAt: '', endsAt: '', status: 'draft' });
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    const [segs, camps] = await Promise.all([api.adminListSegments(), api.adminListCampaigns()]);
    setSegments(segs);
    setCampaigns(camps);
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Campañas"
        subtitle={(<>
          Programa acciones sobre un segmento de clientes. El estado se deriva por fechas (o puede quedar en borrador/pausada). No envía emails en este MVP.
        </>)}
      />
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Nueva campaña</h5>
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label">Nombre <InfoTooltip text="Ej.: Vuelta al cole, Black Friday, Navidad." /></label>
              <input className="form-control" placeholder="Ej: Black Friday" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="col-md-4">
              <label className="form-label">Segmento <InfoTooltip text="Audiencia objetivo a la que se aplica la campaña." /></label>
              <select className="form-select" value={form.segmentId} onChange={(e) => setForm({ ...form, segmentId: e.target.value })}>
                <option value="">Seleccionar…</option>
                {segments.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} ({s.size})</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <label className="form-label">Cupón (opcional) <InfoTooltip text="Código de cupón a comunicar junto con la campaña (si aplica)." /></label>
              <input className="form-control" placeholder="Ej: BRICKS10" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Inicio <InfoTooltip text="Fecha y hora de comienzo (programa la campaña como 'scheduled' hasta ese momento)." /></label>
              <input type="datetime-local" className="form-control" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fin <InfoTooltip text="Fecha y hora de finalización. Luego la campaña queda 'finished'." /></label>
              <input type="datetime-local" className="form-control" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Estado <InfoTooltip text="Borrador o Pausada. Si dejas en borrador y defines fechas, el sistema deriva 'scheduled' o 'running'." /></label>
              <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Borrador</option>
                <option value="paused">Pausada</option>
              </select>
            </div>
            <div className="col-12">
              <button className="btn btn-primary" disabled={loading || !form.name || !form.segmentId} onClick={async () => {
                setLoading(true);
                try {
                  await api.adminCreateCampaign({ ...form, segmentId: Number(form.segmentId) });
                  setForm({ name: '', segmentId: '', couponCode: '', startsAt: '', endsAt: '', status: 'draft' });
                  await load();
                } finally { setLoading(false); }
              }}>Crear campaña</button>
            </div>
          </div>
        </div>
      </div>

      <h5>Campañas existentes</h5>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr><th>ID</th><th>Nombre</th><th>Segmento</th><th>Cupón</th><th>Inicio</th><th>Fin</th><th>Estado</th></tr>
          </thead>
          <tbody>
            {campaigns.map((c) => (
              <tr key={c.id}>
                <td>{c.id}</td>
                <td>{c.name}</td>
                <td>{c.Segment?.name || c.segmentId}</td>
                <td>{c.couponCode || '—'}</td>
                <td>{c.startsAt ? new Date(c.startsAt).toLocaleString() : '—'}</td>
                <td>{c.endsAt ? new Date(c.endsAt).toLocaleString() : '—'}</td>
                <td><span className="badge bg-info text-dark">{c.currentStatus || c.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default CampaignsPage;
