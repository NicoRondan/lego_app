import React from 'react';
import tokens from '../theme/tokens.json';

const hexToRgb = (hex) => {
  const s = hex.replace('#', '');
  const num = parseInt(s, 16);
  return [num >> 16 & 255, num >> 8 & 255, num & 255];
};

const luminance = (r, g, b) => {
  const a = [r, g, b].map(v => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

const contrast = (hex1, hex2) => {
  const [r1, g1, b1] = hexToRgb(hex1);
  const [r2, g2, b2] = hexToRgb(hex2);
  const l1 = luminance(r1, g1, b1) + 0.05;
  const l2 = luminance(r2, g2, b2) + 0.05;
  return l1 > l2 ? l1 / l2 : l2 / l1;
};

const Swatch = ({ name, value }) => {
  const ratio = contrast(value.hex, '#ffffff').toFixed(2);
  const textColor = ratio >= 4.5 ? '#ffffff' : '#000000';
  return (
    <div className="p-3 text-center" style={{ background: value.hex, color: textColor }}>
      <div className="small text-uppercase">{name}</div>
      <div>{value.hex}</div>
      <div className="small">{ratio}:1</div>
    </div>
  );
};

const Styleguide = () => {
  return (
    <div className="container py-4">
      <h1>Styleguide</h1>
      <h2 className="mt-4">Colores de marca</h2>
      <div className="row g-2 mb-4">
        {Object.entries(tokens.brand).map(([name, value]) => (
          <div key={name} className="col-6 col-md-4 col-lg-3">
            <Swatch name={name} value={value} />
          </div>
        ))}
      </div>
      <h2>Botones</h2>
      <button className="btn btn-primary me-2">Primary</button>
      <button className="btn btn-secondary me-2">Secondary</button>
      <button className="btn btn-accent me-2">Accent</button>
      <h2 className="mt-4">Inputs</h2>
      <input className="form-control mb-3" placeholder="Input" />
      <h2>Alerts</h2>
      <div className="alert alert-primary">Primary alert</div>
      <div className="alert alert-success">Success alert</div>
      <div className="alert alert-warning">Warning alert</div>
      <div className="alert alert-danger">Danger alert</div>
      <h2>Badges</h2>
      <span className="badge text-bg-primary me-2">Primary</span>
      <span className="badge text-bg-success me-2">Success</span>
      <span className="badge text-bg-warning me-2">Warning</span>
      <span className="badge text-bg-danger me-2">Danger</span>
      <h2 className="mt-4">Cards</h2>
      <div className="card p-3">Card content</div>
    </div>
  );
};

export default Styleguide;
