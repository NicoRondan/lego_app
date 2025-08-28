import React from 'react';
import ReactDOM from 'react-dom';

// Generic modal styled to match the playful LEGO theme.
// Renders children inside a centered card over a darkened backdrop.
export default function BrickModal({ id, title, children, open = false, onClose, size = '', dialogClassName = '' }) {
  const modalClass = open ? 'modal fade show d-block' : 'modal fade';
  const sizeClass = size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : '';
  const content = (
    <>
      <div className={modalClass} id={id} tabIndex="-1" aria-hidden={open ? 'false' : 'true'} style={{ display: open ? 'block' : 'none' }}>
        <div className={`modal-dialog modal-dialog-centered ${sizeClass} ${dialogClassName}`.trim()}>
          <div className="modal-content brick-modal">
            <div className="modal-header border-0">
            <h5 className="modal-title fw-bold d-flex align-items-center">
              <i className="fa-solid fa-cube me-2 text-warning" aria-hidden="true"></i>
              {title}
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              onClick={onClose}
              aria-label="Cerrar"
            ></button>
          </div>
          <div className="modal-body">{children}</div>
          </div>
        </div>
      </div>
      {open && <div className="modal-backdrop fade show"></div>}
    </>
  );
  // Portal to body to avoid being constrained by parent containers (tables etc.)
  if (typeof document !== 'undefined' && document.body) {
    return ReactDOM.createPortal(content, document.body);
  }
  return content;
}
