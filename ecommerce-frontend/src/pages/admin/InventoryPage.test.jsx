import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../services/api', () => ({
  adminListInventory: jest.fn(),
  adminAdjustInventory: jest.fn(),
  adminUpdateSafetyStock: jest.fn(),
  adminListInventoryMovements: jest.fn(),
}));

import InventoryPage from './InventoryPage.jsx';

describe('InventoryPage', () => {
  test('renders, searches with low-stock filter and shows badge', async () => {
    const api = require('../../services/api');
    api.adminListInventory.mockResolvedValue({
      items: [
        { productId: 1, code: 'SW001', setNumber: '75192', name: 'Millennium Falcon', stock: 5, reserved: 3, available: 2, safetyStock: 3, low: true },
        { productId: 2, code: 'TECH001', setNumber: '42083', name: 'Bugatti', stock: 10, reserved: 0, available: 10, safetyStock: 2, low: false },
      ],
      page: 1,
      pageSize: 20,
      total: 2,
    });
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <InventoryPage />
      </MemoryRouter>,
      container,
    );
    // initial load
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(api.adminListInventory).toHaveBeenCalled();

    // Badge visible for low-stock item
    expect(container.textContent).toMatch(/Bajo stock/);

    // Perform search with low-only
    const input = container.querySelector('input[aria-label="Buscar inventario"]');
    const cb = container.querySelector('#lowOnly');
    input.value = '75192';
    input.dispatchEvent(new Event('input', { bubbles: true }));
    cb.click();
    const buscar = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Buscar'));
    buscar.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(api.adminListInventory).toHaveBeenCalledTimes(2);
  });

  test('adjusts stock via + button and reloads', async () => {
    const api = require('../../services/api');
    api.adminListInventory.mockResolvedValue({
      items: [
        { productId: 1, code: 'SW001', setNumber: '75192', name: 'Millennium Falcon', stock: 5, reserved: 3, available: 2, safetyStock: 3, low: true },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    });
    api.adminAdjustInventory.mockResolvedValue({ ok: true });
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <InventoryPage />
      </MemoryRouter>,
      container,
    );
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    const plusBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('+ Ajustar'));
    act(() => { plusBtn.click(); });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    const modal = document.querySelector('.modal.show .modal-content');
    const qtyInput = modal.querySelector('input[type="number"]');
    qtyInput.value = '2';
    qtyInput.dispatchEvent(new Event('change', { bubbles: true }));
    const applyBtn = Array.from(modal.querySelectorAll('button')).find((b) => b.textContent.includes('Aplicar'));
    act(() => { applyBtn.click(); });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(api.adminAdjustInventory).toHaveBeenCalled();
    // reload
    expect(api.adminListInventory).toHaveBeenCalledTimes(2);
    
  });

  test('edits safety stock and opens movements', async () => {
    const api = require('../../services/api');
    api.adminListInventory.mockResolvedValue({
      items: [
        { productId: 1, code: 'SW001', setNumber: '75192', name: 'Millennium Falcon', stock: 5, reserved: 3, available: 2, safetyStock: 3, low: true },
      ],
      page: 1,
      pageSize: 20,
      total: 1,
    });
    api.adminUpdateSafetyStock.mockResolvedValue({ ok: true });
    api.adminListInventoryMovements.mockResolvedValue({ items: [
      { id: 100, type: 'adjust', qty: 5, createdAt: new Date().toISOString(), reason: 'seed' },
    ] });
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <InventoryPage />
      </MemoryRouter>,
      container,
    );
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    // Edit safety
    const editBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Editar mínimo'));
    act(() => { editBtn.click(); });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    const modal2 = document.querySelector('.modal.show .modal-content');
    const safetyInput = modal2.querySelector('input[type="number"]');
    safetyInput.value = '7';
    safetyInput.dispatchEvent(new Event('change', { bubbles: true }));
    const saveBtn = Array.from(modal2.querySelectorAll('button')).find((b) => b.textContent.includes('Guardar'));
    act(() => { saveBtn.click(); });
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));
    expect(api.adminUpdateSafetyStock).toHaveBeenCalled();

    // Movements
    const movBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Movimientos'));
    movBtn.click();
    await new Promise((r) => setTimeout(r, 0));
    expect(api.adminListInventoryMovements).toHaveBeenCalled();
    expect(container.textContent).toMatch(/Tipo/);
  });
});
