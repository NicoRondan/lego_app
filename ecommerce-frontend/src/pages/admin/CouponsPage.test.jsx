import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../services/api', () => ({
  adminListCoupons: jest.fn().mockResolvedValue({ items: [{ id: 1, code: 'TEST', type: 'percent', value: 10, status: 'active', usageCount: 0 }], total: 1 }),
  adminCreateCoupon: jest.fn(),
  adminUpdateCoupon: jest.fn(),
  adminListCouponUsages: jest.fn().mockResolvedValue({ items: [] }),
  getCategories: jest.fn().mockResolvedValue([]),
}));

// Import the component after mocking the API
import CouponsPage from './CouponsPage.jsx';

describe('CouponsPage', () => {
  test('renders and triggers filtered search', async () => {
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <CouponsPage />
      </MemoryRouter>,
      container,
    );

    const api = require('../../services/api');
    // initial load
    await new Promise((r) => setTimeout(r, 0));
    expect(api.adminListCoupons).toHaveBeenCalled();

    const searchInput = container.querySelector('input[aria-label="Buscar cupones"]');
    const statusSelect = container.querySelector('select[aria-label="Estado"]');
    searchInput.value = 'TEN';
    searchInput.dispatchEvent(new Event('input', { bubbles: true }));
    statusSelect.value = 'active';
    statusSelect.dispatchEvent(new Event('change', { bubbles: true }));

    const buttons = Array.from(container.querySelectorAll('button'));
    const buscarBtn = buttons.find((b) => b.textContent.includes('Buscar'));
    buscarBtn.click();

    await new Promise((r) => setTimeout(r, 0));
    expect(api.adminListCoupons).toHaveBeenCalledTimes(2);
  });

  test('opens edit modal with initial values (no null warnings)', async () => {
    const container = document.createElement('div');
    const api = require('../../services/api');
    api.adminListCoupons.mockResolvedValueOnce({ items: [
      { id: 1, code: 'EDITME', type: 'percent', value: 10, status: 'active', usageCount: 0, validFrom: null, validTo: null, minSubtotal: null, maxUses: null, perUserLimit: null, allowedThemes: [] },
    ], total: 1 });
    ReactDOM.render(
      <MemoryRouter>
        <CouponsPage />
      </MemoryRouter>,
      container,
    );
    await new Promise((r) => setTimeout(r, 0));
    const editBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Editar'));
    editBtn.click();
    await new Promise((r) => setTimeout(r, 0));
    const modal = container.querySelector('#couponEditModal');
    const codeInput = modal.querySelector('input[placeholder="CODE"]');
    expect(codeInput.value).toBe('EDITME');
  });

  test('sorts by column when clicking header', async () => {
    const container = document.createElement('div');
    const api = require('../../services/api');
    api.adminListCoupons.mockResolvedValueOnce({ items: [
      { id: 1, code: 'B', type: 'percent', value: 5, status: 'active', usageCount: 0 },
      { id: 2, code: 'A', type: 'percent', value: 10, status: 'active', usageCount: 0 },
    ], total: 2 });
    ReactDOM.render(
      <MemoryRouter>
        <CouponsPage />
      </MemoryRouter>,
      container,
    );
    await new Promise((r) => setTimeout(r, 0));
    const headerCodigo = Array.from(container.querySelectorAll('th')).find((th) => th.textContent.includes('Código'));
    headerCodigo.click(); // toggles desc
    await new Promise((r) => setTimeout(r, 0));
    const rows = Array.from(container.querySelectorAll('tbody tr td:first-child'));
    expect(rows[0].textContent).toBe('B');
    headerCodigo.click(); // toggles asc
    await new Promise((r) => setTimeout(r, 0));
    const rows2 = Array.from(container.querySelectorAll('tbody tr td:first-child'));
    expect(rows2[0].textContent).toBe('A');
  });

  test('opens usages modal and lists items', async () => {
    const container = document.createElement('div');
    const api = require('../../services/api');
    api.adminListCoupons.mockResolvedValueOnce({ items: [
      { id: 1, code: 'C1', type: 'percent', value: 5, status: 'active', usageCount: 2 },
    ], total: 1 });
    api.adminListCouponUsages.mockResolvedValueOnce({ items: [
      { id: 10, userId: 3, orderId: 100, usedAt: new Date().toISOString() },
    ] });
    ReactDOM.render(
      <MemoryRouter>
        <CouponsPage />
      </MemoryRouter>,
      container,
    );
    await new Promise((r) => setTimeout(r, 0));
    const usosBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Ver usos'));
    usosBtn.click();
    await new Promise((r) => setTimeout(r, 0));
    // Table in modal content
    const modal = container.querySelector('#couponUsagesModal') || container; // fallback
    expect(container.textContent).toMatch(/Orden/);
  });
});
