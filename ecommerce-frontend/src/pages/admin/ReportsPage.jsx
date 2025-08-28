import React, { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import AdminPageHeader from '../../components/admin/AdminPageHeader.jsx';
import AdminFiltersBar from '../../components/admin/AdminFiltersBar.jsx';
import useFilters from '../../hooks/useFilters';
import InfoTooltip from '../../components/InfoTooltip.jsx';
import { API_URL, adminReportSalesSummary, adminReportSalesByTheme, adminReportTopProducts, adminReportLowStock } from '../../services/api';
import useCsvExport from '../../hooks/useCsvExport';
import { formatMoney } from '../../utils/format';
const CURRENCY = process.env.REACT_APP_CURRENCY || 'USD';

const STATUS_OPTIONS = [
  { code: 'pending', label: 'Pendiente' },
  { code: 'picking', label: 'Preparación' },
  { code: 'paid', label: 'Pagado' },
  { code: 'shipped', label: 'Enviado' },
  { code: 'delivered', label: 'Entregado' },
];
const ALL_STATUSES = STATUS_OPTIONS.map((o) => o.code);

function fmtDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function defaultRange(days) {
  const to = new Date();
  const from = new Date();
  from.setDate(to.getDate() - (days - 1));
  return { from: fmtDate(from), to: fmtDate(to) };
}

function StatusMultiSelect({ value, onChange }) {
  const toggle = (s) => {
    const set = new Set(value);
    if (set.has(s)) set.delete(s); else set.add(s);
    onChange(Array.from(set));
  };
  return (
    <div className="d-flex flex-wrap gap-2">
      {STATUS_OPTIONS.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`btn btn-sm ${value.includes(code) ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => toggle(code)}
        >{label}</button>
      ))}
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onChange([...ALL_STATUSES])}>Todos</button>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onChange([])}>Ninguno</button>
    </div>
  );
}

function ReportsPage() {
  const initial = defaultRange(30);
  const [tab, setTab] = useState('sales');
  const { filters, set: setFilter, bind, reset } = useFilters({ from: initial.from, to: initial.to, groupBy: 'day' });
  const [statuses, setStatuses] = useState([...ALL_STATUSES]);
  // groupBy is within `filters`

  const [summary, setSummary] = useState({ buckets: [] });
  const [byTheme, setByTheme] = useState({ rows: [] });
  const [topSets, setTopSets] = useState({ rows: [] });
  const [lowStock, setLowStock] = useState({ rows: [] });
  const [threshold, setThreshold] = useState(5);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Client-side pagination states per tab
  const [pageSummary, setPageSummary] = useState(1);
  const [pageTheme, setPageTheme] = useState(1);
  const [pageTop, setPageTop] = useState(1);
  const [pageStock, setPageStock] = useState(1);
  const [pageSizeSummary, setPageSizeSummary] = useState(20);
  const [pageSizeTheme, setPageSizeTheme] = useState(20);
  const [pageSizeTop, setPageSizeTop] = useState(20);
  const [pageSizeStock, setPageSizeStock] = useState(20);

  const statusParam = useMemo(() => (statuses.length ? statuses.join(',') : ''), [statuses]);

  const load = async (overrides = {}) => {
    try {
      setLoading(true);
      setError('');
      const finalFrom = overrides.from ?? filters.from;
      const finalTo = overrides.to ?? filters.to;
      const [s, t, p] = await Promise.all([
        adminReportSalesSummary({ from: finalFrom, to: finalTo, groupBy: (overrides.groupBy ?? filters.groupBy), status: statusParam }),
        adminReportSalesByTheme({ from: finalFrom, to: finalTo, status: statusParam }),
        adminReportTopProducts({ from: finalFrom, to: finalTo, status: statusParam, limit: 50 }),
      ]);
      setSummary(s);
      setByTheme(t);
      setTopSets(p);
      if (overrides.from) setFilter('from', finalFrom);
      if (overrides.to) setFilter('to', finalTo);
      setPageSummary(1); setPageTheme(1); setPageTop(1);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  const loadLowStock = async () => {
    try {
      setLoading(true);
      setError('');
      const s = await adminReportLowStock({ threshold });
      setLowStock(s);
      setPageStock(1);
    } catch (e) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === 'stock') loadLowStock();
    else load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const totals = useMemo(() => {
    const buckets = summary?.buckets || [];
    const orders = buckets.reduce((a, b) => a + (b.orders || 0), 0);
    const gross = buckets.reduce((a, b) => a + (b.gross || 0), 0);
    const discount = buckets.reduce((a, b) => a + (b.discount || 0), 0);
    const net = buckets.reduce((a, b) => a + (b.net || 0), 0);
    const aov = orders > 0 ? net / orders : 0;
    const avgOffPct = gross > 0 ? (discount / gross) * 100 : 0;
    return { orders, gross, discount, net, aov, avgOffPct };
  }, [summary]);

  // Paged slices
  const pagedBuckets = useMemo(() => {
    const all = summary?.buckets || [];
    const start = (pageSummary - 1) * pageSizeSummary;
    return all.slice(start, start + pageSizeSummary);
  }, [summary, pageSummary, pageSizeSummary]);
  const totalPagesSummary = useMemo(() => Math.max(1, Math.ceil((summary?.buckets?.length || 0) / pageSizeSummary)), [summary, pageSizeSummary]);

  const pagedTheme = useMemo(() => {
    const all = byTheme?.rows || [];
    const start = (pageTheme - 1) * pageSizeTheme;
    return all.slice(start, start + pageSizeTheme);
  }, [byTheme, pageTheme, pageSizeTheme]);
  const totalPagesTheme = useMemo(() => Math.max(1, Math.ceil((byTheme?.rows?.length || 0) / pageSizeTheme)), [byTheme, pageSizeTheme]);

  const pagedTop = useMemo(() => {
    const all = topSets?.rows || [];
    const start = (pageTop - 1) * pageSizeTop;
    return all.slice(start, start + pageSizeTop);
  }, [topSets, pageTop, pageSizeTop]);
  const totalPagesTop = useMemo(() => Math.max(1, Math.ceil((topSets?.rows?.length || 0) / pageSizeTop)), [topSets, pageSizeTop]);

  const pagedStock = useMemo(() => {
    const all = lowStock?.rows || [];
    const start = (pageStock - 1) * pageSizeStock;
    return all.slice(start, start + pageSizeStock);
  }, [lowStock, pageStock, pageSizeStock]);
  const totalPagesStock = useMemo(() => Math.max(1, Math.ceil((lowStock?.rows?.length || 0) / pageSizeStock)), [lowStock, pageSizeStock]);

  const csv = useCsvExport(API_URL);
  const exportCsv = (endpoint) => {
    csv(endpoint, { from: filters.from, to: filters.to, status: statusParam, groupBy: endpoint.includes('summary') ? filters.groupBy : undefined });
  };

  const exportLowStockCsv = () => {
    csv('/admin/reports/stock/low', { threshold });
  };

  return (
    <AdminLayout>
      <AdminPageHeader
        title="Reportes"
        subtitle="Analiza ventas por periodo, temas y sets, y detecta bajo stock. Exporta cualquier vista a CSV."
      />

      <ul className="nav nav-tabs mb-3">
        <li className="nav-item"><button className={`nav-link ${tab==='sales'?'active':''}`} onClick={() => setTab('sales')}>Ventas</button></li>
        <li className="nav-item"><button className={`nav-link ${tab==='theme'?'active':''}`} onClick={() => setTab('theme')}>Por tema</button></li>
        <li className="nav-item"><button className={`nav-link ${tab==='top'?'active':''}`} onClick={() => setTab('top')}>Top sets</button></li>
        <li className="nav-item"><button className={`nav-link ${tab==='stock'?'active':''}`} onClick={() => setTab('stock')}>Bajo stock</button></li>
      </ul>

      {tab !== 'stock' && (
        <>
        <AdminFiltersBar
          className="mb-2"
          searchLabel="Filtrar"
          controls={[
            { type: 'date', key: 'from', label: 'Desde', ...bind('from') },
            { type: 'date', key: 'to', label: 'Hasta', ...bind('to') },
            ...(tab === 'sales' ? [{ type: 'select', key: 'groupBy', label: 'Agrupar por', ...bind('groupBy'), options: [
              { value: 'day', label: 'Día' },
              { value: 'week', label: 'Semana' },
              { value: 'month', label: 'Mes' },
            ]}] : []),
          ]}
          onSearch={() => load({})}
          onClear={() => { const r = defaultRange(30); reset(); setFilter('from', r.from); setFilter('to', r.to); load({ from: r.from, to: r.to }); }}
        />
          <div className="col-md-4 col-lg-3">
            <label className="form-label">Rango rápido</label>
            <div className="d-flex flex-wrap gap-2">
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { const r = defaultRange(7); load({ from: r.from, to: r.to }); }}>Últimos 7 días</button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { const r = defaultRange(30); load({ from: r.from, to: r.to }); }}>Últimos 30 días</button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { const d = new Date(); const start = new Date(d.getFullYear(), d.getMonth(), 1); const r = { from: fmtDate(start), to: fmtDate(d) }; load({ from: r.from, to: r.to }); }}>Este mes</button>
              <button type="button" className="btn btn-outline-secondary btn-sm" onClick={() => { const d = new Date(); const prev = new Date(d.getFullYear(), d.getMonth()-1, 1); const endPrev = new Date(d.getFullYear(), d.getMonth(), 0); const r = { from: fmtDate(prev), to: fmtDate(endPrev) }; load({ from: r.from, to: r.to }); }}>Mes anterior</button>
            </div>
          </div>
        
        <div className="row g-2 mt-2 mb-3">
          <div className="col-12">
            <label className="form-label me-2">Estados</label>
            <div className="d-inline-block">
              <StatusMultiSelect value={statuses} onChange={setStatuses} />
            </div>
          </div>
        </div>
        </>
      )}

      {tab === 'sales' && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-md-3"><div className="p-3 border rounded"><div className="text-muted">Pedidos<InfoTooltip text="Cantidad de órdenes en el rango seleccionado" /></div><div className="fs-4">{totals.orders}</div></div></div>
            <div className="col-md-3"><div className="p-3 border rounded"><div className="text-muted">Neto<InfoTooltip text="Ingresos netos = Bruto - Descuentos (antes de impuestos/envío)" /></div><div className="fs-4">{formatMoney(totals.net, CURRENCY)}</div></div></div>
            <div className="col-md-3"><div className="p-3 border rounded"><div className="text-muted">Ticket prom.<InfoTooltip text="Promedio por pedido = Neto / Pedidos" /></div><div className="fs-4">{formatMoney(totals.aov, CURRENCY)}</div></div></div>
            <div className="col-md-3"><div className="p-3 border rounded"><div className="text-muted">% OFF prom.<InfoTooltip text="Promedio de descuento sobre el Gross (Descuento/Gross)" /></div><div className="fs-4">{totals.avgOffPct.toFixed(1)}%</div></div></div>
          </div>
          <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-outline-secondary" onClick={() => exportCsv('/admin/reports/sales/summary')}>Exportar CSV</button>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? <div>Cargando...</div> : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Periodo</th>
                    <th>Pedidos<InfoTooltip text="Número de órdenes en el período" /></th>
                    <th>Unidades<InfoTooltip text="Unidades vendidas" /></th>
                    <th>Bruto<InfoTooltip text="Suma de (precio x cantidad)" /></th>
                    <th>Desc.<InfoTooltip text="Total de descuentos aplicados (cupones/ofertas)" /></th>
                    <th>Neto<InfoTooltip text="Bruto - Descuentos" /></th>
                    <th>Ticket prom.<InfoTooltip text="Promedio por pedido = Neto / Pedidos" /></th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedBuckets || []).map((b) => (
                    <tr key={b.periodStart}>
                      <td>{b.periodStart}</td>
                      <td>{b.orders}</td>
                      <td>{b.qty}</td>
                      <td>{formatMoney(b.gross?.toFixed ? b.gross : Number(b.gross || 0), CURRENCY)}</td>
                      <td>{formatMoney(b.discount?.toFixed ? b.discount : Number(b.discount || 0), CURRENCY)}</td>
                      <td>{formatMoney(b.net?.toFixed ? b.net : Number(b.net || 0), CURRENCY)}</td>
                      <td>{formatMoney(b.avgOrderValue?.toFixed ? b.avgOrderValue : Number(b.avgOrderValue || 0), CURRENCY)}</td>
                  </tr>
                ))}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center">
                <div>Mostrando {pagedBuckets.length} de {summary?.buckets?.length || 0}</div>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label m-0">Por página</label>
                  <select className="form-select form-select-sm" style={{width: 'auto'}} value={pageSizeSummary} onChange={(e)=>{setPageSizeSummary(parseInt(e.target.value,10)); setPageSummary(1);}}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary" disabled={pageSummary<=1} onClick={()=>setPageSummary(pageSummary-1)}>«</button>
                    <span className="btn btn-outline-secondary disabled">{pageSummary} / {totalPagesSummary}</span>
                    <button className="btn btn-outline-secondary" disabled={pageSummary>=totalPagesSummary} onClick={()=>setPageSummary(pageSummary+1)}>»</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'theme' && (
        <>
          <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-outline-secondary" onClick={() => exportCsv('/admin/reports/sales/by-theme')}>Exportar CSV</button>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? <div>Cargando...</div> : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Tema</th>
                    <th>Pedidos<InfoTooltip text="Órdenes que incluyen productos del tema" /></th>
                    <th>Unidades<InfoTooltip text="Unidades vendidas (acumulado del tema)" /></th>
                    <th>Neto<InfoTooltip text="Ingresos netos atribuidos al tema" /></th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedTheme || []).map((r) => (
                    <tr key={r.theme}>
                      <td>{r.theme}</td>
                      <td>{r.orders}</td>
                      <td>{r.qty}</td>
                      <td>{r.net?.toFixed ? r.net.toFixed(2) : r.net}</td>
                    </tr>
                  ))}
                  {!(byTheme.rows||[]).length && <tr><td colSpan="4" className="text-center text-muted">Sin resultados</td></tr>}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center">
                <div>Mostrando {pagedTheme.length} de {byTheme?.rows?.length || 0}</div>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label m-0">Por página</label>
                  <select className="form-select form-select-sm" style={{width: 'auto'}} value={pageSizeTheme} onChange={(e)=>{setPageSizeTheme(parseInt(e.target.value,10)); setPageTheme(1);}}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary" disabled={pageTheme<=1} onClick={()=>setPageTheme(pageTheme-1)}>«</button>
                    <span className="btn btn-outline-secondary disabled">{pageTheme} / {totalPagesTheme}</span>
                    <button className="btn btn-outline-secondary" disabled={pageTheme>=totalPagesTheme} onClick={()=>setPageTheme(pageTheme+1)}>»</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'top' && (
        <>
          <div className="d-flex justify-content-end mb-2">
            <button className="btn btn-outline-secondary" onClick={() => exportCsv('/admin/reports/sales/top-products')}>Exportar CSV</button>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? <div>Cargando...</div> : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Set</th>
                    <th>Nombre</th>
                    <th>Unidades<InfoTooltip text="Unidades vendidas del set" /></th>
                    <th>Neto<InfoTooltip text="Ingresos netos del set" /></th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedTop || []).map((r) => (
                    <tr key={r.productId}>
                      <td>{r.setNumber}</td>
                      <td>{r.name}</td>
                      <td>{r.qty}</td>
                      <td>{r.net?.toFixed ? r.net.toFixed(2) : r.net}</td>
                    </tr>
                  ))}
                  {!(topSets.rows||[]).length && <tr><td colSpan="4" className="text-center text-muted">Sin resultados</td></tr>}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center">
                <div>Mostrando {pagedTop.length} de {topSets?.rows?.length || 0}</div>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label m-0">Por página</label>
                  <select className="form-select form-select-sm" style={{width: 'auto'}} value={pageSizeTop} onChange={(e)=>{setPageSizeTop(parseInt(e.target.value,10)); setPageTop(1);}}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary" disabled={pageTop<=1} onClick={()=>setPageTop(pageTop-1)}>«</button>
                    <span className="btn btn-outline-secondary disabled">{pageTop} / {totalPagesTop}</span>
                    <button className="btn btn-outline-secondary" disabled={pageTop>=totalPagesTop} onClick={()=>setPageTop(pageTop+1)}>»</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {tab === 'stock' && (
        <>
          <div className="row g-3 mb-3">
            <div className="col-md-3">
              <label className="form-label">Threshold</label>
              <input type="number" className="form-control" value={threshold} onChange={(e) => setThreshold(parseInt(e.target.value, 10) || 0)} />
            </div>
            <div className="col-md-2 align-self-end">
              <button className="btn btn-primary w-100" onClick={loadLowStock}>Refrescar</button>
            </div>
            <div className="col-md-2 align-self-end">
              <button className="btn btn-outline-secondary w-100" onClick={exportLowStockCsv}>Exportar CSV</button>
            </div>
          </div>
          {error && <div className="alert alert-danger">{error}</div>}
          {loading ? <div>Cargando...</div> : (
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Stock<InfoTooltip text="Stock actual en catálogo" /></th>
                    <th>Reservado<InfoTooltip text="Unidades comprometidas en órdenes pendientes/pagadas/picking" /></th>
                    <th>Safety<InfoTooltip text="Umbral de seguridad (parámetro del reporte)" /></th>
                    <th>Disponible<InfoTooltip text="Stock - Reservado" /></th>
                  </tr>
                </thead>
                <tbody>
                  {(pagedStock || []).map((r) => (
                    <tr key={r.productId}>
                      <td>{r.name}</td>
                      <td>{r.stock}</td>
                      <td>{r.reserved}</td>
                      <td>{r.safetyStock}</td>
                      <td>{(r.stock - r.reserved)}</td>
                    </tr>
                  ))}
                  {!(lowStock.rows||[]).length && <tr><td colSpan="5" className="text-center text-muted">Sin resultados</td></tr>}
                </tbody>
              </table>
              <div className="d-flex justify-content-between align-items-center">
                <div>Mostrando {pagedStock.length} de {lowStock?.rows?.length || 0}</div>
                <div className="d-flex align-items-center gap-2">
                  <label className="form-label m-0">Por página</label>
                  <select className="form-select form-select-sm" style={{width: 'auto'}} value={pageSizeStock} onChange={(e)=>{setPageSizeStock(parseInt(e.target.value,10)); setPageStock(1);}}>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                  <div className="btn-group">
                    <button className="btn btn-outline-secondary" disabled={pageStock<=1} onClick={()=>setPageStock(pageStock-1)}>«</button>
                    <span className="btn btn-outline-secondary disabled">{pageStock} / {totalPagesStock}</span>
                    <button className="btn btn-outline-secondary" disabled={pageStock>=totalPagesStock} onClick={()=>setPageStock(pageStock+1)}>»</button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}

export default ReportsPage;
