import React from 'react';

// Generic modal styled to match the playful LEGO theme.
// Renders children inside a centered card over a darkened backdrop.
export default function BrickModal({ id, title, children, open = false, onClose }) {
  const modalClass = open ? 'modal fade show d-block' : 'modal fade';
  return (
    <>
      <div className={modalClass} id={id} tabIndex="-1" aria-hidden={open ? 'false' : 'true'}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content brick-modal bg-body text-body">
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
}
