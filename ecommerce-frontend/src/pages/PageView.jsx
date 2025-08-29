import React, { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import * as api from '../services/api';
import { toHtmlSafe } from '../utils/markdown';


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

  const html = useMemo(() => (page ? toHtmlSafe(page.body || '') : ''), [page]);

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
