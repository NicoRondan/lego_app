import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import * as api from '../../services/api';

function UsersPage() {
  const [q, setQ] = useState('');
  const [page, setPage] = useState(1);
  const [data, setData] = useState([]);
  const [meta, setMeta] = useState({ total: 0, pageSize: 20 });

  const load = async () => {
    const res = await api.adminListUsers({ q, page });
    setData(res.data || []);
    setMeta(res.meta || { total: 0, pageSize: 20, page });
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [page]);

  const totalPages = Math.max(1, Math.ceil((meta.total || 0) / (meta.pageSize || 20)));

  return (
    <AdminLayout>
      <h1 className="mb-3">Usuarios</h1>
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Buscar por nombre o email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary" onClick={() => { setPage(1); load(); }}>Buscar</button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Opt-in</th><th>Alta</th>
            </tr>
          </thead>
          <tbody>
            {data.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><a href={`/admin/users/${u.id}`}>{u.name}</a></td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>{u.marketingOptIn ? <span className="badge bg-success">Opt-in</span> : <span className="badge bg-secondary">No</span>}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="d-flex justify-content-between align-items-center">
        <div>Mostrando {data.length} de {meta.total}</div>
        <div className="btn-group">
          <button className="btn btn-outline-secondary" disabled={page<=1} onClick={() => setPage(page-1)}>Anterior</button>
          <span className="btn btn-outline-secondary disabled">{page}/{totalPages}</span>
          <button className="btn btn-outline-secondary" disabled={page>=totalPages} onClick={() => setPage(page+1)}>Siguiente</button>
        </div>
      </div>
    </AdminLayout>
  );
}

export default UsersPage;

