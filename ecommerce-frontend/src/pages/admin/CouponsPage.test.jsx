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
});
