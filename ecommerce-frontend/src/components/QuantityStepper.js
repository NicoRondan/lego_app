import React from 'react';

// Quantity stepper with accessible controls
function QuantityStepper({ value, min = 1, max, onChange }) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => {
    const next = value + 1;
    onChange(max ? Math.min(max, next) : next);
  };
  const handleChange = (e) => {
    const val = parseInt(e.target.value, 10);
    if (Number.isNaN(val)) return;
    if (max) {
      onChange(Math.min(Math.max(min, val), max));
    } else {
      onChange(Math.max(min, val));
    }
  };
  return (
    <div className="input-group" role="group" aria-label="Selector de cantidad">
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={decrease}
        aria-label="Disminuir cantidad"
      >
        -
      </button>
      <input
        type="number"
        className="form-control text-center"
        value={value}
        min={min}
        max={max}
        onChange={handleChange}
        aria-label="Cantidad"
      />
      <button
        type="button"
        className="btn btn-outline-secondary"
        onClick={increase}
        aria-label="Incrementar cantidad"
      >
        +
      </button>
    </div>
  );
}

export default QuantityStepper;
