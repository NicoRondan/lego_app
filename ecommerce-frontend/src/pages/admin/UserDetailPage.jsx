import React, { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout.jsx';
import * as api from '../../services/api';
import InfoTooltip from '../../components/InfoTooltip.jsx';
import BrickModal from '../../components/lego/BrickModal.jsx';

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
  const [audit, setAudit] = useState([]);

  const load = useCallback(async () => {
    const u = await api.adminGetUser(id);
    setUser(u);
    setForm({ name: u.name, email: u.email, phone: u.phone || '', marketingOptIn: !!u.marketingOptIn });
    const addrs = await api.adminListAddresses(id);
    setAddresses(addrs);
    const aud = await api.adminListUserAudit(id).catch(() => []);
    setAudit(aud || []);
  }, [id]);

  useEffect(() => { load(); }, [load]);

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
      <h2 className="mb-1">Usuario #{user.id} – {user.name}</h2>
      <p className="text-muted mb-3">Edita datos de perfil, administra direcciones, revisa actividad y genera token seguro para impersonar.</p>
      <TabNav tab={tab} setTab={setTab} />
      {tab === 'perfil' && (
        <div className="card p-3">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Nombre <InfoTooltip text="Nombre completo del cliente" /></label>
              <input className="form-control" placeholder="Juan Pérez" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Email <InfoTooltip text="Correo principal del cliente" /></label>
              <input className="form-control" placeholder="user@example.com" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Teléfono <InfoTooltip text="Formato sugerido: +54 9 11 1234-5678" /></label>
              <input className="form-control" placeholder="+54 9 11 1234-5678" value={form.phone} onChange={(e)=>setForm({...form,phone:e.target.value})} />
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
                  <label className="form-label">Tipo <InfoTooltip text="Envío o Facturación. El default es exclusivo por tipo" /></label>
                  <select name="type" className="form-select" defaultValue="shipping">
                    <option value="shipping">Envío</option>
                    <option value="billing">Facturación</option>
                  </select>
                </div>
                <div className="col-6">
                  <label className="form-label">Nombre <InfoTooltip text="Alias de la dirección (Casa, Trabajo)" /></label>
                  <input name="name" className="form-control" placeholder="Casa / Trabajo" required />
                </div>
                <div className="col-12">
                  <label className="form-label">Dirección <InfoTooltip text="Calle y número" /></label>
                  <input name="line1" className="form-control" placeholder="Av. Siempre Viva 742" required />
                </div>
                <div className="col-12">
                  <label className="form-label">Línea 2</label>
                  <input name="line2" className="form-control" placeholder="Piso / Depto" />
                </div>
                <div className="col-6">
                  <label className="form-label">Ciudad</label>
                  <input name="city" className="form-control" placeholder="CABA" required />
                </div>
                <div className="col-6">
                  <label className="form-label">Provincia/Estado</label>
                  <input name="state" className="form-control" placeholder="Buenos Aires" />
                </div>
                <div className="col-6">
                  <label className="form-label">CP</label>
                  <input name="zip" className="form-control" placeholder="C1000" />
                </div>
                <div className="col-6">
                  <label className="form-label">País</label>
                  <input name="country" className="form-control" placeholder="AR" required />
                </div>
                <div className="col-12">
                  <div className="form-check">
                    <input id="isDefault" name="isDefault" type="checkbox" className="form-check-input" />
                    <label htmlFor="isDefault" className="form-check-label">Marcar como default <InfoTooltip text="Sólo una default por tipo (envío/facturación)" /></label>
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
          <hr />
          <div className="fw-bold mb-2">Auditoría admin</div>
          {(audit || []).length === 0 && <div className="text-muted">Sin actividades de admin</div>}
          {(audit || []).map(a => (
            <div key={a.id} className="small text-muted">{new Date(a.createdAt || a.created_at).toLocaleString()} – {a.action} {a.ip ? `(${a.ip})` : ''}</div>
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
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name) e.name = 'Requerido';
    if (!form.line1) e.line1 = 'Requerido';
    if (!form.city) e.city = 'Requerido';
    if (!form.country) e.country = 'Requerido';
    if (form.zip) {
      const cc = (form.country || '').toUpperCase();
      const patterns = {
        US: /^\d{5}(-\d{4})?$/,
        AR: /^[A-Z]?\d{4}[A-Z]{0,3}$/,
        BR: /^\d{5}-?\d{3}$/,
        MX: /^\d{5}$/,
        ES: /^\d{5}$/,
        CL: /^\d{7}$/,
      };
      const p = patterns[cc];
      if (p && !p.test(form.zip)) e.zip = 'Formato de CP inválido para ' + cc;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!validate()) return;
    await api.adminUpdateAddress(id, a.id, form);
    setEditing(false);
    onSaved?.();
  };

  return (
    <li className="list-group-item">
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <div className="fw-bold">{a.type || '—'} {a.isDefault ? <span className="badge bg-primary ms-1">Default</span> : null}</div>
          <div>{a.name || ''} {a.line1 || a.street || ''} {a.city || ''} {a.state || ''} {a.zip || ''} {a.country || ''}</div>
        </div>
        <div className="btn-group">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setEditing(true)}>Editar</button>
          <button className="btn btn-sm btn-outline-danger" onClick={onDelete}>Eliminar</button>
        </div>
      </div>

      <BrickModal id={`addr-${a.id}`} title={`Editar dirección • ${a.name || ''}`} open={editing} onClose={() => setEditing(false)}>
        <div className="row g-2 align-items-end">
          <div className="col-4">
            <label className="form-label">Tipo</label>
            <select name="type" className="form-select" value={form.type} onChange={(e)=>setForm({...form,type:e.target.value})}>
              <option value="shipping">Envío</option>
              <option value="billing">Facturación</option>
            </select>
          </div>
          <div className="col-8">
            <label className="form-label">Nombre</label>
            <input name="name" className={`form-control ${errors.name?'is-invalid':''}`} placeholder="Casa / Trabajo" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} />
            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
          </div>
          <div className="col-12">
            <label className="form-label">Dirección</label>
            <input name="line1" className={`form-control ${errors.line1?'is-invalid':''}`} placeholder="Av. Siempre Viva 742" value={form.line1} onChange={(e)=>setForm({...form,line1:e.target.value})} />
            {errors.line1 && <div className="invalid-feedback">{errors.line1}</div>}
          </div>
          <div className="col-12">
            <label className="form-label">Línea 2</label>
            <input name="line2" className="form-control" placeholder="Piso / Depto" value={form.line2} onChange={(e)=>setForm({...form,line2:e.target.value})} />
          </div>
          <div className="col-4">
            <label className="form-label">Ciudad</label>
            <input name="city" className={`form-control ${errors.city?'is-invalid':''}`} placeholder="CABA" value={form.city} onChange={(e)=>setForm({...form,city:e.target.value})} />
            {errors.city && <div className="invalid-feedback">{errors.city}</div>}
          </div>
          <div className="col-4">
            <label className="form-label">Provincia/Estado</label>
            <input name="state" className="form-control" placeholder="Buenos Aires" value={form.state} onChange={(e)=>setForm({...form,state:e.target.value})} />
          </div>
          <div className="col-4">
            <label className="form-label">CP</label>
            <input name="zip" className={`form-control ${errors.zip?'is-invalid':''}`} placeholder="C1000 / 12345-678" value={form.zip} onChange={(e)=>setForm({...form,zip:e.target.value})} />
            {errors.zip && <div className="invalid-feedback">{errors.zip}</div>}
          </div>
          <div className="col-8">
            <label className="form-label">País</label>
            <input name="country" className={`form-control ${errors.country?'is-invalid':''}`} placeholder="AR" value={form.country} onChange={(e)=>setForm({...form,country:e.target.value})} />
            {errors.country && <div className="invalid-feedback">{errors.country}</div>}
          </div>
          <div className="col-4">
            <div className="form-check">
              <input id={`def-${a.id}`} name="isDefault" type="checkbox" className="form-check-input" checked={form.isDefault} onChange={(e)=>setForm({...form,isDefault:e.target.checked})} />
              <label htmlFor={`def-${a.id}`} className="form-check-label">Default</label>
            </div>
          </div>
          <div className="col-12 d-flex gap-2 justify-content-end">
            <button className="btn btn-outline-secondary" onClick={() => setEditing(false)}>Cancelar</button>
            <button className="btn btn-primary" onClick={save}>Guardar</button>
          </div>
        </div>
      </BrickModal>
    </li>
  );
}
