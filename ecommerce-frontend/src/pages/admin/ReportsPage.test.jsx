import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../services/api', () => ({
  adminReportSalesSummary: jest.fn().mockResolvedValue({ buckets: [] }),
  adminReportSalesByTheme: jest.fn().mockResolvedValue({ rows: [] }),
  adminReportTopProducts: jest.fn().mockResolvedValue({ rows: [] }),
  adminReportLowStock: jest.fn().mockResolvedValue({ rows: [] }),
}));

import ReportsPage from './ReportsPage.jsx';

describe('ReportsPage', () => {
  test('renders status buttons including pending and default filter calls', async () => {
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>,
      container,
    );
    const api = require('../../services/api');
    await new Promise((r) => setTimeout(r, 0));
    // Initial calls (sales tabs)
    expect(api.adminReportSalesSummary).toHaveBeenCalled();
    expect(api.adminReportSalesByTheme).toHaveBeenCalled();
    expect(api.adminReportTopProducts).toHaveBeenCalled();

    // Default dates should be prefilled
    const fromInput = container.querySelector('input[type="date"]');
    const toInput = container.querySelectorAll('input[type="date"]')[1];
    expect(fromInput.value).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(toInput.value).toMatch(/\d{4}-\d{2}-\d{2}/);
    // Ensure API was called with from/to
    const callArgs = api.adminReportSalesSummary.mock.calls[0][0];
    expect(callArgs).toEqual(expect.objectContaining({ from: expect.any(String), to: expect.any(String) }));

    // Ensure pending is present as a toggle
    const buttons = Array.from(container.querySelectorAll('button'));
    const pendingBtn = buttons.find((b) => b.textContent.trim() === 'Pendiente');
    expect(pendingBtn).toBeTruthy();

    // Toggle on pending and click Filtrar to trigger refresh
    pendingBtn.click();
    const filtrar = buttons.find((b) => b.textContent.includes('Filtrar'));
    filtrar.click();
    await new Promise((r) => setTimeout(r, 0));

    // Verify updated call
    expect(api.adminReportSalesSummary).toHaveBeenCalledTimes(2);
  });

  test('displays KPI values from summary buckets', async () => {
    const api = require('../../services/api');
    api.adminReportSalesSummary.mockResolvedValueOnce({ buckets: [
      { periodStart: '2025-08-01', orders: 1, qty: 3, gross: 120, discount: 20, net: 100, avgOrderValue: 100 },
      { periodStart: '2025-08-02', orders: 1, qty: 1, gross: 50, discount: 0, net: 50, avgOrderValue: 50 },
    ] });
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <ReportsPage />
      </MemoryRouter>,
      container,
    );
    await new Promise((r) => setTimeout(r, 0));
    const text = container.textContent;
    expect(text).toMatch(/Pedidos\??\s*2/);
    expect(text).toMatch(/Neto\??\s*\$?\s*150\.00/);
    expect(text).toMatch(/Ticket prom\.?\??\s*\$?\s*75\.00/);
  });
});
