import React from 'react';
import './AgeRangeSlider.css';

function AgeRangeSlider({ min = 0, max = 99, minValue, maxValue, onChangeMin, onChangeMax }) {
  const range = max - min;
  const minPercent = ((minValue - min) / range) * 100;
  const maxPercent = ((maxValue - min) / range) * 100;

  return (
    <div>
      <div className="age-range-slider position-relative">
        <div className="track" />
        <div
          className="range"
          style={{ left: `${minPercent}%`, width: `${maxPercent - minPercent}%` }}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={minValue}
          onChange={(e) => onChangeMin(Math.min(Number(e.target.value), maxValue))}
        />
        <input
          type="range"
          min={min}
          max={max}
          value={maxValue}
          onChange={(e) => onChangeMax(Math.max(Number(e.target.value), minValue))}
        />
      </div>
      <div className="d-flex justify-content-between small mt-1">
        <span>{minValue}</span>
        <span>{maxValue}</span>
      </div>
    </div>
  );
}

export default AgeRangeSlider;
