import React from 'react';

// Generic pager for admin tables.
// Props: page, pageSize, total, onChangePage(next), onChangePageSize(size)
export default function AdminTablePager({ page = 1, pageSize = 20, total = 0, onChangePage, onChangePageSize, className = '' }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / (pageSize || 20)));
  return (
    <div className={`d-flex justify-content-between align-items-center ${className}`.trim()}>
      <div>Mostrando página {page} de {totalPages} — Total {total}</div>
      <div className="d-flex align-items-center gap-2">
        <div className="btn-group">
          <button className="btn btn-outline-secondary btn-sm" disabled={page <= 1} onClick={() => onChangePage?.(page - 1)}>Anterior</button>
          <span className="btn btn-outline-secondary btn-sm disabled">{page}/{totalPages}</span>
          <button className="btn btn-outline-secondary btn-sm" disabled={page >= totalPages} onClick={() => onChangePage?.(page + 1)}>Siguiente</button>
        </div>
        {onChangePageSize && (
          <div className="ms-2">
            <label className="me-2">Por página</label>
            <select
              aria-label="Page size"
              className="form-select d-inline-block"
              style={{ width: 90 }}
              value={pageSize}
              onChange={(e) => onChangePageSize?.(parseInt(e.target.value, 10) || 20)}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        )}
      </div>
    </div>
  );
}

