import React from 'react';

// Reusable multi-select of statuses rendered as toggle buttons.
// Props: options [{code,label}], value (array of codes), onChange(newArray)
export default function StatusMultiSelect({ options = [], value = [], onChange }) {
  const toggle = (code) => {
    const set = new Set(value);
    if (set.has(code)) set.delete(code); else set.add(code);
    onChange(Array.from(set));
  };
  return (
    <div className="d-flex flex-wrap gap-2">
      {options.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          className={`btn btn-sm ${value.includes(code) ? 'btn-primary' : 'btn-outline-secondary'}`}
          onClick={() => toggle(code)}
        >{label}</button>
      ))}
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onChange(options.map((o) => o.code))}>Todos</button>
      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => onChange([])}>Ninguno</button>
    </div>
  );
}

