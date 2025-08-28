import React from 'react';
import ReactDOM from 'react-dom';
import { MemoryRouter } from 'react-router-dom';

jest.mock('../../contexts/AuthContext.jsx', () => ({
  useAuth: () => ({ user: { id: 1, name: 'Soporte', role: 'support' }, logout: jest.fn() }),
}));

import Navbar from '../Navbar';

describe('Navbar impersonation banner', () => {
  test('shows banner when impersonation cookie is present and allows logout', async () => {
    document.cookie = 'impersonation=1';
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>,
      container,
    );
    expect(container.textContent).toMatch(/Impersonando a un cliente/i);
    const btn = Array.from(container.querySelectorAll('button')).find((b) => /Salir/i.test(b.textContent));
    expect(btn).toBeTruthy();
  });
});

