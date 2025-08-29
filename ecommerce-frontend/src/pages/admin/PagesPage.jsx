import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import * as api from '../../services/api';

function mdToHtml(md) {
  // very naive markdown -> html (headings, paragraphs, links)
  let html = md || '';
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  html = html.split(/\n{2,}/).map(p => `<p>${p}</p>`).join('');
  return html;
}

function Editor({ initial, onSaved }) {
  const [form, setForm] = useState(initial || { slug: '', title: '', body: '', publishedAt: '' });
  const previewHtml = useMemo(() => {
    const body = form.body || '';
    if (body.trim().startsWith('<')) return body; // assume HTML
    return mdToHtml(body);
  }, [form.body]);
  const save = async () => {
    const data = { slug: form.slug, title: form.title, body: form.body, publishedAt: form.publishedAt || null };
    if (initial?.id) await api.adminUpdatePage(initial.id, data); else await api.adminCreatePage(data);
    await onSaved();
  };
  return (
    <div className="row g-3">
      <div className="col-md-6">
        <div className="mb-2">
          <label className="form-label">Slug</label>
          <input className="form-control" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="terminos" />
        </div>
        <div className="mb-2">
          <label className="form-label">Título</label>
          <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        </div>
        <div className="mb-2">
          <label className="form-label">Contenido (Markdown o HTML)</label>
          <textarea className="form-control" rows={12} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        </div>
        <div className="mb-2">
          <label className="form-label">Publicado en</label>
          <input type="datetime-local" className="form-control" value={form.publishedAt ? String(form.publishedAt).slice(0,16) : ''} onChange={(e) => setForm({ ...form, publishedAt: e.target.value })} />
        </div>
        <button className="btn btn-primary" onClick={save}>Guardar</button>
      </div>
      <div className="col-md-6">
        <label className="form-label">Previsualización</label>
        <div className="lego-container p-3" dangerouslySetInnerHTML={{ __html: previewHtml }} />
      </div>
    </div>
  );
}

function PagesPage() {
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    setLoading(true);
    try { setPages(await api.adminListPages()); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  return (
    <AdminLayout>
      <h1>Páginas</h1>
      <p className="text-muted">Editor con preview. Acceso público por /p/:slug</p>

      {editing ? (
        <Editor initial={editing.id ? editing : null} onSaved={async () => { setEditing(null); await load(); }} />
      ) : (
        <>
          <div className="mb-3">
            <button className="btn btn-outline-primary" onClick={() => setEditing({})}>+ Nueva página</button>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr><th>ID</th><th>Slug</th><th>Título</th><th>Publicado</th><th>Acciones</th></tr>
              </thead>
              <tbody>
                {pages.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.slug}</td>
                    <td>{p.title}</td>
                    <td>{p.publishedAt ? new Date(p.publishedAt).toLocaleString() : '-'}</td>
                    <td><button className="btn btn-sm btn-secondary" onClick={() => setEditing(p)}>Editar</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

export default PagesPage;

