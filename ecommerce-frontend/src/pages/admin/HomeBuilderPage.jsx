import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import * as api from '../../services/api';

function SectionRow({ section, onChange, onRemove, onMoveUp, onMoveDown }) {
  return (
    <div className="card mb-2">
      <div className="card-body d-flex align-items-center gap-3">
        <span className="badge text-bg-secondary text-uppercase">{section.type}</span>
        {section.type === 'hero' && (
          <>
            <label className="form-label mb-0">bannerId</label>
            <input type="number" value={section.bannerId || ''} onChange={(e) => onChange({ ...section, bannerId: parseInt(e.target.value, 10) || null })} className="form-control form-control-sm" style={{ width: 120 }} />
          </>
        )}
        {section.type === 'rail' && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <label className="form-label mb-0">Título</label>
            <input type="text" value={section.title || ''} onChange={(e) => onChange({ ...section, title: e.target.value })} className="form-control form-control-sm" style={{ width: 220 }} />
            <label className="form-label mb-0">Sort</label>
            <select value={section.query?.sort || ''} onChange={(e) => onChange({ ...section, query: { ...(section.query || {}), sort: e.target.value } })} className="form-select form-select-sm" style={{ width: 180 }}>
              <option value="">(por defecto)</option>
              <option value="sales_desc">Más vendidos</option>
              <option value="createdAt_desc">Novedades</option>
              <option value="price_asc">Precio ascendente</option>
              <option value="price_desc">Precio descendente</option>
            </select>
            <label className="form-label mb-0">Tema</label>
            <input type="text" value={section.query?.theme || ''} onChange={(e) => onChange({ ...section, query: { ...(section.query || {}), theme: e.target.value } })} className="form-control form-control-sm" style={{ width: 160 }} />
          </div>
        )}
        {section.type === 'notice' && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <label className="form-label mb-0">Texto</label>
            <input type="text" value={section.text || ''} onChange={(e) => onChange({ ...section, text: e.target.value })} className="form-control form-control-sm" style={{ width: 360 }} />
            <label className="form-label mb-0">Variante</label>
            <select value={section.variant || 'info'} onChange={(e) => onChange({ ...section, variant: e.target.value })} className="form-select form-select-sm" style={{ width: 140 }}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
            </select>
          </div>
        )}
        <div className="ms-auto d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary" onClick={onMoveUp}>↑</button>
          <button className="btn btn-sm btn-outline-secondary" onClick={onMoveDown}>↓</button>
          <button className="btn btn-sm btn-outline-danger" onClick={onRemove}>Eliminar</button>
        </div>
      </div>
    </div>
  );
}

function HomeBuilderPage() {
  const [sections, setSections] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.adminGetHomeLayout();
        const initial = data.latestDraft?.json?.sections || data.latestPublished?.json?.sections || [];
        setSections(initial);
        setInfo({ latestDraft: data.latestDraft, latestPublished: data.latestPublished });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const addSection = (type) => {
    const s = type === 'hero' ? { type, bannerId: null } : type === 'notice' ? { type, text: '', variant: 'info' } : { type, title: '', query: { sort: '' } };
    setSections((prev) => [...prev, s]);
  };

  const move = (idx, dir) => {
    setSections((prev) => {
      const arr = [...prev];
      const j = idx + dir;
      if (j < 0 || j >= arr.length) return arr;
      const tmp = arr[idx]; arr[idx] = arr[j]; arr[j] = tmp; return arr;
    });
  };

  const save = async (publish = false) => {
    setSaving(true);
    try {
      const json = { sections };
      await api.adminSaveHomeLayout({ json, publish });
      const data = await api.adminGetHomeLayout();
      setInfo({ latestDraft: data.latestDraft, latestPublished: data.latestPublished });
    } finally { setSaving(false); }
  };

  return (
    <AdminLayout>
      <h1>Home Builder</h1>
      <p className="text-muted">Editá la estructura de la Home. Al publicar, se actualiza sin redeploy.</p>

      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          <div className="mb-3 d-flex gap-2">
            <button className="btn btn-outline-primary btn-sm" onClick={() => addSection('hero')}>+ Hero</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => addSection('rail')}>+ Rail</button>
            <button className="btn btn-outline-primary btn-sm" onClick={() => addSection('notice')}>+ Notice</button>
          </div>
          {sections.map((s, i) => (
            <SectionRow
              key={i}
              section={s}
              onChange={(ns) => setSections((prev) => prev.map((x, idx) => idx === i ? ns : x))}
              onRemove={() => setSections((prev) => prev.filter((_, idx) => idx !== i))}
              onMoveUp={() => move(i, -1)}
              onMoveDown={() => move(i, +1)}
            />
          ))}

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-secondary" disabled={saving} onClick={() => save(false)}>Guardar borrador</button>
            <button className="btn btn-primary" disabled={saving} onClick={() => save(true)}>Publicar</button>
          </div>

          <div className="mt-4">
            <h6>Estado</h6>
            <pre className="bg-light p-2 rounded"><code>{JSON.stringify(info, null, 2)}</code></pre>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default HomeBuilderPage;

