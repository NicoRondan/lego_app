import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('../../services/api', () => ({
  adminGetUser: jest.fn(),
  adminListAddresses: jest.fn(),
  adminUpdateAddress: jest.fn(),
  adminDeleteAddress: jest.fn(),
  adminCreateAddress: jest.fn(),
}));

import UserDetailPage from './UserDetailPage.jsx';

describe('UserDetailPage - Addresses editing', () => {
  test('edits an address and reloads list', async () => {
    const api = require('../../services/api');
    api.adminGetUser.mockResolvedValue({ id: 1, name: 'User 1', email: 'u1@example.com', marketingOptIn: false, orders: [], events: [] });
    api.adminListAddresses.mockResolvedValue([
      { id: 10, type: 'shipping', name: 'Casa', line1: 'Calle 123', city: 'X', isDefault: 1 },
    ]);
    api.adminUpdateAddress.mockResolvedValue({ ok: true });

    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter initialEntries={["/admin/users/1"]}>
        <Routes>
          <Route path="/admin/users/:id" element={<UserDetailPage />} />
        </Routes>
      </MemoryRouter>,
      container,
    );

    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    // go to Direcciones
    const tabs = Array.from(container.querySelectorAll('button.nav-link'));
    const dirTab = tabs.find((b) => /Direcciones/i.test(b.textContent));
    dirTab.click();
    await new Promise((r) => setTimeout(r, 0));

    // click Editar
    const editBtn = Array.from(container.querySelectorAll('button')).find((b) => /Editar/.test(b.textContent));
    editBtn.click();
    await new Promise((r) => setTimeout(r, 0));

    // toggle default and save
    const cb = container.querySelector('input.form-check-input');
    cb.click();
    const save = Array.from(container.querySelectorAll('button')).find((b) => /Guardar/.test(b.textContent));
    save.click();
    await new Promise((r) => setTimeout(r, 0));
    await new Promise((r) => setTimeout(r, 0));

    expect(api.adminUpdateAddress).toHaveBeenCalled();
    expect(api.adminListAddresses).toHaveBeenCalledTimes(2);
  });
});

