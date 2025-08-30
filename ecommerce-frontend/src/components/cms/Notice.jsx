import React from 'react';

function Notice({ text, variant = 'info' }) {
  const cls = variant === 'warning' ? 'alert-warning' : variant === 'success' ? 'alert-success' : 'alert-info';
  return (
    <div className={`alert ${cls}`} role="alert">
      {text}
    </div>
  );
}

export default Notice;

