import React from 'react';

// Quantity stepper with accessible controls
function QuantityStepper({ value, min = 1, onChange }) {
  const decrease = () => onChange(Math.max(min, value - 1));
  const increase = () => onChange(value + 1);
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
        onChange={(e) => onChange(parseInt(e.target.value, 10))}
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
