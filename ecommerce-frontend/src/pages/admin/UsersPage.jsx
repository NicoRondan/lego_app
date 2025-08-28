import React, { useCallback, useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminTablePager from '../../components/admin/AdminTablePager.jsx';
import useListState from '../../hooks/useListState';
import * as api from '../../services/api';

function UsersPage() {
  const [q, setQ] = useState('');
  const list = useListState(async ({ page }) => {
    const res = await api.adminListUsers({ q, page });
    return { items: res.data || [], total: res.meta?.total || 0, pageSize: res.meta?.pageSize || 20 };
  }, { initialPage: 1, initialPageSize: 20 });

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Usuarios"
        subtitle="Consulta, busca y gestiona perfiles de clientes. También puedes ver direcciones, actividad e impersonar usuarios."
      />
      <div className="d-flex gap-2 mb-3">
        <input className="form-control" placeholder="Buscar por nombre o email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className="btn btn-primary" onClick={() => list.applyFilters({})}>Buscar</button>
      </div>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Email</th><th>Teléfono</th><th>Badges</th><th>Alta</th>
            </tr>
          </thead>
          <tbody>
            {list.items.map(u => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td><a href={`/admin/users/${u.id}`}>{u.name}</a></td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td>
                  {u.marketingOptIn && <span className="badge bg-success me-1">Opt-in</span>}
                  {u.hasOrders && <span className="badge bg-info text-dark me-1">Con pedidos</span>}
                  {new Date(u.createdAt) > new Date(Date.now() - 7*24*60*60*1000) && <span className="badge bg-primary">Nuevo</span>}
                </td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AdminTablePager
        page={list.page}
        pageSize={list.pageSize}
        total={list.total}
        onChangePage={list.changePage}
        onChangePageSize={list.changePageSize}
      />
    </AdminLayout>
  );
}

export default UsersPage;
