import React from 'react';

// AdminFiltersBar
// Reusable bar for filters with a consistent layout.
// Accepts an array of controls with minimal metadata so pages remain declarative.
// Each control item: { type: 'text'|'select'|'date', key, label, ariaLabel, placeholder?, value, onChange, options? }
// The bar renders a primary action button (Buscar) and an optional Clear (Limpiar) button.
// Props:
// - searchLabel: optional label for primary button (default: 'Buscar')
// - clearLabel: optional label for clear button (default: 'Limpiar')
// - col: default bootstrap col class for each control (e.g., 'col-md-3'). Each control can override via `control.col`.
export default function AdminFiltersBar({ controls = [], onSearch, onClear, className = '', searchLabel = 'Buscar', clearLabel = 'Limpiar', col = 'col-md-3' }) {
  return (
    <div className={`row g-3 align-items-end ${className}`.trim()}>
      {controls.map((c) => (
        <div className={c.col || col} key={c.key}>
          {c.label && <label className="form-label">{c.label}</label>}
          {c.type === 'select' ? (
            <select
              aria-label={c.ariaLabel || c.label}
              className="form-select"
              value={c.value}
              onChange={(e) => c.onChange?.(e.target.value)}
            >
              {(c.options || []).map((opt) => (
                <option key={String(opt.value)} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : c.type === 'checkbox' ? (
            <div className="form-check mb-2">
              <input
                id={c.id || c.key}
                className="form-check-input"
                type="checkbox"
                checked={!!c.value}
                onChange={(e) => c.onChange?.(e.target.checked)}
              />
              <label className="form-check-label" htmlFor={c.id || c.key}>{c.label}</label>
            </div>
          ) : (
            <input
              aria-label={c.ariaLabel || c.label}
              type={c.type === 'date' ? 'date' : 'text'}
              className="form-control"
              placeholder={c.placeholder}
              value={c.value}
              onChange={(e) => c.onChange?.(e.target.value)}
            />
          )}
        </div>
      ))}
      <div className="col-md-2">
        <button type="button" className="btn btn-primary w-100" onClick={onSearch}>{searchLabel}</button>
      </div>
      {onClear && (
        <div className="col-md-2">
          <button type="button" className="btn btn-outline-secondary w-100" onClick={onClear}>{clearLabel}</button>
        </div>
      )}
    </div>
  );
}
