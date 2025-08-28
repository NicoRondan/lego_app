import { useEffect, useRef } from 'react';

function InfoTooltip({ text }) {
  const ref = useRef(null);

  useEffect(() => {
    if (ref.current && window.bootstrap) {
      window.bootstrap.Tooltip.getOrCreateInstance(ref.current);
    }
  }, []);

  return (
    <span
      ref={ref}
      className="badge bg-info text-dark rounded-circle align-middle ms-1"
      data-bs-toggle="tooltip"
      title={text}
      style={{ cursor: 'help' }}
    >
      ?
    </span>
  );
}

export default InfoTooltip;

