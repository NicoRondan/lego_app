import React from 'react';

// AdminFiltersBar
// Reusable bar for filters with a consistent layout.
// Accepts an array of controls with minimal metadata so pages remain declarative.
// Each control item: { type: 'text'|'select'|'date', key, label, ariaLabel, placeholder?, value, onChange, options? }
// The bar renders a primary action button (Buscar) and an optional Clear (Limpiar) button.
export default function AdminFiltersBar({ controls = [], onSearch, onClear, className = '' }) {
  return (
    <div className={`row g-3 align-items-end ${className}`.trim()}>
      {controls.map((c) => (
        <div className="col-md-3" key={c.key}>
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
        <button type="button" className="btn btn-primary w-100" onClick={onSearch}>Buscar</button>
      </div>
      {onClear && (
        <div className="col-md-2">
          <button type="button" className="btn btn-outline-secondary w-100" onClick={onClear}>Limpiar</button>
        </div>
      )}
    </div>
  );
}

