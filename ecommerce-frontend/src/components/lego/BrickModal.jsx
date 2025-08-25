import React from 'react';
export default function BrickModal({id,title,children}){
  return (
    <div className="modal fade" id={id} tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content brick-modal">
          <div className="modal-header brick">
            <h5 className="modal-title">{title}</h5>
            <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
          </div>
          <div className="modal-body plate">{children}</div>
        </div>
      </div>
    </div>
  );
}
