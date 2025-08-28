import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import BrickModal from './lego/BrickModal.jsx';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, title: '', body: '', confirmText: 'Confirmar', cancelText: 'Cancelar', resolve: null });

  const confirm = useCallback(({ title = 'Confirmar', body = '¿Continuar?', confirmText = 'Confirmar', cancelText = 'Cancelar' } = {}) => new Promise((resolve) => {
    setState({ open: true, title, body, confirmText, cancelText, resolve });
  }), []);

  const close = (result) => {
    const r = state.resolve; setState((s) => ({ ...s, open: false, resolve: null })); r?.(result);
  };

  const value = useMemo(() => ({ confirm }), [confirm]);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <BrickModal id="confirm-modal" title={state.title} open={state.open} onClose={() => close(false)}>
        <p className="mb-3">{state.body}</p>
        <div className="d-flex justify-content-end gap-2">
          <button type="button" className="btn btn-outline-secondary" onClick={() => close(false)}>{state.cancelText}</button>
          <button type="button" className="btn btn-danger" onClick={() => close(true)}>{state.confirmText}</button>
        </div>
      </BrickModal>
    </ConfirmContext.Provider>
  );
}

// Hook: if provider is missing (tests simples), fall back to window.confirm
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    return async ({ title, body } = {}) => {
      // eslint-disable-next-line no-alert
      const res = typeof window !== 'undefined' && window.confirm ? window.confirm((title ? title + '\n' : '') + (body || '')) : true;
      return !!res;
    };
  }
  return ctx.confirm;
}

