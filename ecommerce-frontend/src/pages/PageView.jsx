import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';

function mdToHtml(md) {
  let html = md || '';
  html = html.replace(/^# (.*)$/gm, '<h1>$1</h1>');
  html = html.replace(/^## (.*)$/gm, '<h2>$1</h2>');
  html = html.replace(/^### (.*)$/gm, '<h3>$1</h3>');
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>');
  html = html.split(/\n{2,}/).map(p => `<p>${p}</p>`).join('');
  return html;
}

function PageView() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [notFound, setNotFound] = useState(false);
  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const p = await api.getPageBySlug(slug);
        if (mounted) setPage(p);
      } catch {
        if (mounted) setNotFound(true);
      }
    }
    load();
    return () => { mounted = false; };
  }, [slug]);

  const html = useMemo(() => {
    if (!page) return '';
    const body = page.body || '';
    if (body.trim().startsWith('<')) return body;
    return mdToHtml(body);
  }, [page]);

  if (notFound) return <div className="container my-5"><h1>Página no encontrada</h1></div>;
  if (!page) return <div className="container my-5"><p>Cargando…</p></div>;

  // Basic SEO: set document title
  if (page?.title) document.title = `${page.title} – Brick Market`;

  return (
    <div className="container my-5">
      <h1 className="mb-4">{page.title}</h1>
      <div className="lego-container p-3" dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}

export default PageView;
