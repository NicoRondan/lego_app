import React, { useEffect, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import InfoTooltip from '../../components/InfoTooltip.jsx';
import BrickModal from '../../components/lego/BrickModal.jsx';
import {
  adminListInventory,
  adminAdjustInventory,
  adminUpdateSafetyStock,
  adminListInventoryMovements,
} from '../../services/api';

function Badge({ low }) {
  if (!low) return null;
  return <span className="badge bg-danger ms-2">Bajo stock</span>;
}

function InventoryRow({ item, onAdjusted, onSafetyUpdated }) {
  const [movs, setMovs] = useState([]);
  const [movsOpen, setMovsOpen] = useState(false);
  const [loadingMovs, setLoadingMovs] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustSign, setAdjustSign] = useState(1);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [safetyVal, setSafetyVal] = useState(String(item.safetyStock || 0));

  const toggleMovs = async () => {
    if (movsOpen) {
      setMovsOpen(false);
      return;
    }
    setMovsOpen(true);
    if (!movs || movs.length === 0) {
      setLoadingMovs(true);
      const res = await adminListInventoryMovements(item.productId, { limit: 20 });
      setMovs(res.items || []);
      setLoadingMovs(false);
    }
  };

  const openAdjust = (sign) => {
    setAdjustSign(sign);
    setAdjustQty('');
    setAdjustReason('');
    setAdjustOpen(true);
  };
  const submitAdjust = async (e) => {
    e.preventDefault();
    const n = parseInt(adjustQty, 10);
    if (!Number.isInteger(n) || n <= 0) return alert('Ingrese un entero mayor a 0');
    const qty = adjustSign * n;
    await adminAdjustInventory(item.productId, { qty, reason: adjustReason || '' });
    setAdjustOpen(false);
    onAdjusted();
  };

  const openSafety = () => { setSafetyVal(String(item.safetyStock || 0)); setSafetyOpen(true); };
  const submitSafety = async (e) => {
    e.preventDefault();
    const safetyStock = parseInt(safetyVal, 10);
    if (!Number.isInteger(safetyStock) || safetyStock < 0) return alert('Valor inválido');
    await adminUpdateSafetyStock(item.productId, { safetyStock });
    setSafetyOpen(false);
    onSafetyUpdated();
  };

  return (
    <>
      <tr>
        <td>
          <div className="d-flex align-items-center">
            <div>
              <div className="fw-bold">{item.name} <Badge low={item.low} /></div>
              <div className="text-muted small">{item.code} · Set {item.setNumber || '—'}</div>
            </div>
          </div>
        </td>
        <td className="text-end">{item.stock}</td>
        <td className="text-end">{item.reserved}</td>
        <td className="text-end">{item.available}</td>
        <td className="text-end">{item.safetyStock}</td>
        <td className="text-end">
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-secondary" onClick={() => openAdjust(+1)}>+ Ajustar</button>
            <button className="btn btn-outline-secondary" onClick={() => openAdjust(-1)}>- Ajustar</button>
          </div>
          <button className="btn btn-sm btn-outline-warning ms-2" onClick={openSafety}>Editar mínimo</button>
          <button className="btn btn-sm btn-primary ms-2" onClick={toggleMovs}>{movsOpen ? 'Ocultar' : 'Movimientos'}</button>
        </td>
      </tr>
      {movsOpen && (
        <tr>
          <td colSpan={6}>
            <div className="p-2 border rounded">
              {loadingMovs ? (
                <div>Cargando...</div>
              ) : (
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th className="text-end">Cantidad</th>
                      <th>Motivo/Pedido</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movs.map((m) => (
                      <tr key={m.id}>
                        <td>{new Date(m.createdAt || m.created_at).toLocaleString()}</td>
                        <td>{m.type}</td>
                        <td className="text-end">{m.qty}</td>
                        <td>{m.orderId ? `Orden #${m.orderId}` : (m.reason || '')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}

      {/* Modales */}
      <BrickModal id={`adjust-${item.productId}`} title={`Ajustar stock • ${item.name}`} open={adjustOpen} onClose={() => setAdjustOpen(false)}>
        <form onSubmit={submitAdjust} className="row g-3">
          <div className="col-12">
            <label className="form-label d-flex align-items-center gap-2">
              Cantidad
              <InfoTooltip text="Ingrese un entero > 0. El signo (+/−) se elige con el botón presionado." />
            </label>
            <div className="input-group">
              <span className="input-group-text">{adjustSign > 0 ? '+' : '-'}</span>
              <input
                className="form-control"
                type="number"
                name="qty"
                step="1"
                min="1"
                placeholder="Cantidad a ajustar (entero > 0)"
                aria-label="Cantidad a ajustar"
                value={adjustQty}
                onChange={(e) => setAdjustQty(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="col-12">
            <label className="form-label d-flex align-items-center gap-2">
              Motivo (opcional)
              <InfoTooltip text="Describe la causa del ajuste: inventario, corrección, rotura, recepción, etc." />
            </label>
            <input
              className="form-control"
              name="reason"
              placeholder="Inventario, rotura, corrección…"
              aria-label="Motivo del ajuste"
              value={adjustReason}
              onChange={(e) => setAdjustReason(e.target.value)}
            />
          </div>
          <div className="col-12 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setAdjustOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Aplicar</button>
          </div>
        </form>
      </BrickModal>

      <BrickModal id={`safety-${item.productId}`} title={`Editar mínimo • ${item.name}`} open={safetyOpen} onClose={() => setSafetyOpen(false)}>
        <form onSubmit={submitSafety} className="row g-3">
          <div className="col-12">
            <label className="form-label d-flex align-items-center gap-2">
              Mínimo (safety stock)
              <InfoTooltip text="Si Disponible (Stock−Reservado) es menor o igual a este valor, el producto se marca 'Bajo stock' y aparece en el filtro correspondiente." />
            </label>
            <input
              className="form-control"
              type="number"
              name="safetyStock"
              step="1"
              min="0"
              placeholder="Ej: 3"
              aria-label="Mínimo de seguridad"
              value={safetyVal}
              onChange={(e) => setSafetyVal(e.target.value)}
              required
            />
          </div>
          <div className="col-12 d-flex justify-content-end gap-2">
            <button type="button" className="btn btn-outline-secondary" onClick={() => setSafetyOpen(false)}>Cancelar</button>
            <button type="submit" className="btn btn-primary">Guardar</button>
          </div>
        </form>
      </BrickModal>
    </>
  );
}

function InventoryPage() {
  const [q, setQ] = useState('');
  const [low, setLow] = useState(false);
  const [data, setData] = useState({ items: [], page: 1, pageSize: 20, total: 0 });

  const load = async () => {
    const res = await adminListInventory({ q, lowStockOnly: low, page: 1, pageSize: 50 });
    setData(res);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <AdminLayout>
      <h2 className="mb-1">Inventario</h2>
      <p className="text-muted">Consulta stock, reservas y disponible. Ajusta cantidades, edita mínimos y revisa movimientos por producto.</p>
      <div className="d-flex align-items-end gap-2 mb-3">
        <div className="flex-grow-1">
          <label className="form-label">Buscar por set o nombre</label>
          <input
            aria-label="Buscar inventario"
            className="form-control"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="75192 o Hogwarts"
          />
        </div>
        <div className="form-check mb-2">
          <input id="lowOnly" className="form-check-input" type="checkbox" checked={low} onChange={(e) => setLow(e.target.checked)} />
          <label className="form-check-label" htmlFor="lowOnly">Bajo stock</label>
        </div>
        <button className="btn btn-primary mb-2" onClick={load}>Buscar</button>
      </div>

      <div className="table-responsive">
        <table className="table align-middle">
          <thead>
            <tr>
              <th>Producto</th>
              <th className="text-end">Stock</th>
              <th className="text-end">Reservado</th>
              <th className="text-end">Disponible</th>
              <th className="text-end">Mínimo</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((it) => (
              <InventoryRow key={it.productId} item={it} onAdjusted={load} onSafetyUpdated={load} />
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}

export default InventoryPage;
