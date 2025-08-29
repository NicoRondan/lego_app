import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import * as api from '../../services/api';
import HeroBanner from '../../components/cms/HeroBanner';
import Notice from '../../components/cms/Notice';
import SectionRail from '../../components/cms/SectionRail';

function SectionRow({ section, onChange, onRemove, onMoveUp, onMoveDown, banners }) {
  return (
    <div className="card mb-2">
      <div className="card-body d-flex align-items-center gap-3">
        <span className="badge text-bg-secondary text-uppercase">{section.type}</span>
        {section.type === 'hero' && (
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <label className="form-label mb-0">Banner</label>
            <select
              className="form-select form-select-sm"
              style={{ width: 260 }}
              value={section.bannerId || ''}
              onChange={(e) => onChange({ ...section, bannerId: e.target.value ? parseInt(e.target.value, 10) : null })}
            >
              <option value="">(Elegir banner hero)</option>
              {(banners || []).filter(b => b.placement === 'home-hero').map((b) => (
                <option key={b.id} value={b.id}>{`#${b.id} – ${b.title}`}</option>
              ))}
            </select>
            <input list="heroBanners" className="form-control form-control-sm" placeholder="Buscar banner por título" style={{ width: 240 }}
                   onChange={(e) => onChange({ ...section, bannerId: e.target.value ? parseInt(e.target.value, 10) : null })} />
            <datalist id="heroBanners">
              {(banners || []).filter(b => b.placement === 'home-hero').map((b) => (
                <option key={b.id} value={b.id}>{`#${b.id} – ${b.title}`}</option>
              ))}
            </datalist>
            <span className="text-muted small">o ID manual:</span>
            <input type="number" value={section.bannerId || ''} onChange={(e) => onChange({ ...section, bannerId: parseInt(e.target.value, 10) || null })} className="form-control form-control-sm" style={{ width: 120 }} />
            {section.bannerId && (banners || []).some(b => b.id === section.bannerId) && (
              <span className="d-flex align-items-center gap-2 ms-2">
                <img alt="preview" src={(banners || []).find(b => b.id === section.bannerId)?.imageUrl} style={{ height: 32, width: 64, objectFit: 'cover', borderRadius: 4 }} />
                <span className="small text-muted">{(banners || []).find(b => b.id === section.bannerId)?.title}</span>
              </span>
            )}
          </div>
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
            <label className="form-label mb-0">CTA</label>
            <input type="text" placeholder="Etiqueta" value={section.cta?.label || ''} onChange={(e) => onChange({ ...section, cta: { ...(section.cta || {}), label: e.target.value } })} className="form-control form-control-sm" style={{ width: 160 }} />
            <input type="text" placeholder="/ruta" value={section.cta?.href || ''} onChange={(e) => onChange({ ...section, cta: { ...(section.cta || {}), href: e.target.value } })} className="form-control form-control-sm" style={{ width: 220 }} />
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
  const [showPreview, setShowPreview] = useState(false);
  const [banners, setBanners] = useState([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await api.adminGetHomeLayout();
        const initial = data.latestDraft?.json?.sections || data.latestPublished?.json?.sections || [];
        setSections(initial);
        setInfo({ latestDraft: data.latestDraft, latestPublished: data.latestPublished });
        // banners for hero selector
        try { setBanners(await api.adminListBanners()); } catch {}
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
              banners={banners}
            />
          ))}

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-secondary" disabled={saving} onClick={() => save(false)}>Guardar borrador</button>
            <button className="btn btn-primary" disabled={saving} onClick={() => save(true)}>Publicar</button>
            <button className="btn btn-outline-info" type="button" onClick={() => setShowPreview(p => !p)}>{showPreview ? 'Ocultar vista previa' : 'Vista previa'}</button>
          </div>

          <div className="mt-4">
            <h6>Estado</h6>
            <pre className="bg-light text-dark p-2 rounded" style={{ whiteSpace: 'pre-wrap' }}>
              {info ? JSON.stringify({
                latestDraft: info.latestDraft ? { version: info.latestDraft.version, publishedAt: info.latestDraft.publishedAt, sections: info.latestDraft.json?.sections?.length ?? 0 } : null,
                latestPublished: info.latestPublished ? { version: info.latestPublished.version, publishedAt: info.latestPublished.publishedAt, sections: info.latestPublished.json?.sections?.length ?? 0 } : null,
              }, null, 2) : 'Sin datos'}
            </pre>
          </div>

          {showPreview && (
            <div className="mt-4">
              <h6>Vista previa</h6>
              <div className="lego-container p-3" style={{ border: '1px dashed var(--bs-secondary)', borderRadius: 6 }}>
                {sections.map((s, idx) => {
                  if (s.type === 'hero') return <HeroBanner key={idx} banner={(banners || []).find(b => b.id === s.bannerId)} />;
                  if (s.type === 'notice') return <Notice key={idx} text={s.text} variant={s.variant} />;
                  if (s.type === 'rail') return <SectionRail key={idx} title={s.title} query={s.query || {}} cta={s.cta} />;
                  return null;
                })}
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

export default HomeBuilderPage;
