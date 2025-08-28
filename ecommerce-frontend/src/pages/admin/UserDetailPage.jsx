import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import * as api from '../../services/api';

function TabNav({ tab, setTab }) {
  return (
    <ul className="nav nav-tabs mb-3">
      {['perfil','direcciones','pedidos','actividad','impersonar'].map(t => (
        <li className="nav-item" key={t}>
          <button className={`nav-link ${tab===t?'active':''}`} onClick={() => setTab(t)}>{t[0].toUpperCase()+t.slice(1)}</button>
        </li>
      ))}
    </ul>
  );
}

function UserDetailPage() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('perfil');
  const [form, setForm] = useState({ name: '', email: '', phone: '', marketingOptIn: false });
  const [addresses, setAddresses] = useState([]);

  const load = async () => {
    const u = await api.adminGetUser(id);
    setUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || '', marketingOptIn: !!u.marketingOptIn });
    const addrs = await api.adminListAddresses(id);
    setAddresses(addrs);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const save = async () => {
    await api.adminUpdateUser(id, form);
    await load();
  };

  const addAddress = async (evt) => {
    evt.preventDefault();
    const fd = new FormData(evt.target);
    const data = Object.fromEntries(fd.entries());
    data.isDefault = data.isDefault === 'on';
    await api.adminCreateAddress(id, data);
    evt.target.reset();
    await load();
  };

  const delAddress = async (addressId) => {
    await api.adminDeleteAddress(id, addressId);
    await load();
  };

  const impersonate = async () => {
    const { token } = await api.adminImpersonateUser(id);
    const url = `${window.location.origin}/impersonate?token=${encodeURIComponent(token)}`;
    // open helper page that exchanges token and redirects to home
    const w = window.open(url, '_blank');
    if (!w) alert('Permite popups para continuar');
  };

  if (!user) return <AdminLayout>Loading...</AdminLayout>;

  return (
    <AdminLayout>
      <h1 className="mb-3">Usuario #{user.id} – {user.name}</h1>
      <TabNav tab={tab} setTab={setTab} />
      {tab === 'perfil' && (
        <div className="card p-3">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email</label>
              <input className="form-control" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Teléfono</label>
              <input className="form-control" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
            </div>
            <div className="col-md-6 d-flex align-items-end">
              <div className="form-check">
                <input id="optin" type="checkbox" className="form-check-input" checked={form.marketingOptIn} onChange={(e)=>setForm({...form,marketingOptIn:e.target.checked})} />
                <label htmlFor="optin" className="form-check-label">Opt-in newsletters</label>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <button className="btn btn-primary" onClick={save}>Guardar</button>
          </div>
        </div>
      )}

      {tab === 'direcciones' && (
        <div className="row">
          <div className="col-md-6">
            <h5>Listado</h5>
            <ul className="list-group">
              {addresses.map(a => (
                <AddressItem key={a.id} a={a} onDelete={() => delAddress(a.id)} onSaved={load} />
              ))}
            </ul>
          </div>
          <div className="col-md-6">
            <h5>Nueva dirección</h5>
            <form onSubmit={addAddress}>
              <div className="row g-2">
                <div className="col-6">
                  <label className="form-label">Tipo</label>
                  <select name="type" className="form-select" defaultValue="shipping">
                    <option value="shipping">Envío</option>
                    <option value="billing">Facturación</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Nombre</label>
                  <input name="name" className="form-control" />
                </div>
                <div className="col-12">
                  <label className="form-label">Dirección</label>
                  <input name="line1" className="form-control" />
                </div>
                <div className="col-12">
                  <label className="form-label">Línea 2</label>
                  <input name="line2" className="form-control" />
                </div>
                <div className="col-6">
                  <label className="form-label">Ciudad</label>
                  <input name="city" className="form-control" />
                </div>
                <div className="col-6">
                  <label className="form-label">Provincia/Estado</label>
                  <input name="state" className="form-control" />
                </div>
                <div className="col-6">
                  <label className="form-label">CP</label>
                  <input name="zip" className="form-control" />
                </div>
                <div className="col-6">
                  <label className="form-label">País</label>
                  <input name="country" className="form-control" />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input id="isDefault" name="isDefault" type="checkbox" className="form-check-input" />
                    <label htmlFor="isDefault" className="form-check-label">Marcar como default</label>
                  </div>
                </div>
                <div className="col-12">
                  <button className="btn btn-primary" type="submit">Agregar</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {tab === 'pedidos' && (
        <div className="card p-3">
          {(user.orders || []).length === 0 && <div>Sin pedidos recientes</div>}
          {(user.orders || []).map(o => (
            <div key={o.id} className="border-bottom pb-2 mb-2">
              <div className="d-flex justify-content-between"><div>Pedido #{o.id}</div><div className="badge bg-secondary">{o.status}</div></div>
              <div>Items: {o.items?.length || 0} — Total: {o.total}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'actividad' && (
        <div className="card p-3">
          {(user.events || []).length === 0 && <div>Sin eventos</div>}
          {(user.events || []).map(ev => (
            <div key={ev.id} className="small text-muted">{new Date(ev.createdAt).toLocaleString()} – {ev.type}</div>
          ))}
        </div>
      )}

      {tab === 'impersonar' && (
        <div className="alert alert-warning">
          <p>Genera un token de una sola vez y abre la tienda en una nueva pestaña para impersonar a este cliente.</p>
          <button className="btn btn-outline-warning" onClick={impersonate}><i className="fa-solid fa-user-secret me-1" /> Impersonar</button>
        </div>
      )}
    </AdminLayout>
  );
}

export default UserDetailPage;

function AddressItem({ a, onDelete, onSaved }) {
  const { id } = useParams();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    type: a.type || 'shipping',
    name: a.name || '',
    line1: a.line1 || a.street || '',
    line2: a.line2 || '',
    city: a.city || '',
    state: a.state || '',
    zip: a.zip || '',
    country: a.country || '',
    isDefault: !!a.isDefault,
  });

  const save = async () => {
    await api.adminUpdateAddress(id, a.id, form);
    setEditing(false);
    onSaved?.();
  };

  if (!editing) {
    return (
      <li className="list-group-item d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-bold">{a.type || '—'} {a.isDefault ? <span className="badge bg-primary ms-1">Default</span> : null}</div>
          <div>{a.name || ''} {a.line1 || a.street || ''} {a.city || ''} {a.state || ''} {a.zip || ''} {a.country || ''}</div>
        </div>
        <div className="btn-group">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(true)}>Editar</button>
          <button className="btn btn-sm btn-outline-danger" onClick={onDelete}>Eliminar</button>
        </div>
      </li>
    );
  }

  return (
    <li className="list-group-item">
      <div className="row g-2 align-items-end">
        <div className="col-4">
          <label className="form-label">Tipo</label>
          <select className="form-select" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}>
            <option value="shipping">Envío</option>
            <option value="billing">Facturación</option>
          </select>
        </div>
        <div className="col-8">
          <label className="form-label">Nombre</label>
          <input className="form-control" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
        </div>
        <div className="col-12">
          <label className="form-label">Dirección</label>
          <input className="form-control" value={form.line1} onChange={(e)=>setForm({...form,line1:e.target.value})} />
        </div>
        <div className="col-12">
          <label className="form-label">Línea 2</label>
          <input className="form-control" value={form.line2} onChange={(e)=>setForm({...form,line2:e.target.value})} />
        </div>
        <div className="col-4">
          <label className="form-label">Ciudad</label>
          <input className="form-control" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} />
        </div>
        <div className="col-4">
          <label className="form-label">Provincia/Estado</label>
          <input className="form-control" value={form.state} onChange={(e)=>setForm({...form,state:e.target.value})} />
        </div>
        <div className="col-4">
          <label className="form-label">CP</label>
          <input className="form-control" value={form.zip} onChange={(e)=>setForm({...form,zip:e.target.value})} />
        </div>
        <div className="col-8">
          <label className="form-label">País</label>
          <input className="form-control" value={form.country} onChange={(e)=>setForm({...form,country:e.target.value})} />
        </div>
        <div className="col-4">
          <div className="form-check">
            <input id={`def-${a.id}`} type="checkbox" className="form-check-input" checked={form.isDefault} onChange={(e)=>setForm({...form,isDefault:e.target.checked})} />
            <label htmlFor={`def-${a.id}`} className="form-check-label">Default</label>
          </div>
        </div>
        <div className="col-12 d-flex gap-2">
          <button className="btn btn-primary" onClick={save}>Guardar</button>
          <button className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancelar</button>
        </div>
      </div>
    </li>
  );
}
