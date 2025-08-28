import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
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
  const [movs, setMovs] = useState(null);
  const [loadingMovs, setLoadingMovs] = useState(false);

  const fetchMovs = async () => {
    setLoadingMovs(true);
    const res = await adminListInventoryMovements(item.productId, { limit: 20 });
    setMovs(res.items || []);
    setLoadingMovs(false);
  };

  const adjust = async (sign) => {
    const raw = prompt(`Cantidad a ${sign > 0 ? 'sumar' : 'restar'} (entero):`);
    if (raw == null) return;
    const qty = parseInt(raw, 10) * sign;
    if (!Number.isInteger(qty) || qty === 0) return alert('Cantidad inválida');
    const reason = prompt('Motivo del ajuste:') || '';
    await adminAdjustInventory(item.productId, { qty, reason });
    onAdjusted();
  };

  const editSafety = async () => {
    const raw = prompt('Nuevo mínimo (safety stock):', String(item.safetyStock || 0));
    if (raw == null) return;
    const safetyStock = parseInt(raw, 10);
    if (!Number.isInteger(safetyStock) || safetyStock < 0) return alert('Valor inválido');
    await adminUpdateSafetyStock(item.productId, { safetyStock });
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
            <button className="btn btn-outline-secondary" onClick={() => adjust(+1)}>+ Ajustar</button>
            <button className="btn btn-outline-secondary" onClick={() => adjust(-1)}>- Ajustar</button>
          </div>
          <button className="btn btn-sm btn-outline-primary ms-2" onClick={editSafety}>Editar mínimo</button>
          <button className="btn btn-sm btn-outline-dark ms-2" onClick={fetchMovs}>Movimientos</button>
        </td>
      </tr>
      {movs && (
        <tr>
          <td colSpan={6}>
            <div className="bg-light p-2 rounded">
              {loadingMovs ? (
                <div>Cargando...</div>
              ) : (
                <table className="table table-sm mb-0">
                  <thead>
                    <tr>
                      <th>Fecha</th>
                      <th>Tipo</th>
                      <th className="text-end">Qty</th>
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
      <h1 className="mb-3">Inventario</h1>
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

