import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

let mockUser = null;

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

function Login() {
  const location = useLocation();
  return <div>{location.state?.redirectTo || 'login'}</div>;
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    mockUser = null;
  });

  it('redirects unauthenticated users to login preserving redirect', () => {
    const container = document.createElement('div');
    act(() => {
      ReactDOM.render(
        <MemoryRouter initialEntries={['/secret?x=1']}>
          <Routes>
            <Route
              path="/secret"
              element={
                <ProtectedRoute>
                  <div>Secret</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
          </Routes>
        </MemoryRouter>,
        container,
      );
    });
    expect(container.textContent).toBe('/secret?x=1');
  });

  it('shows 403 message when role mismatches', () => {
    mockUser = { role: 'user' };
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <div>Admin</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
      container,
    );
    expect(container.textContent).toContain('403');
  });

  it('renders children when authenticated and role matches', () => {
    mockUser = { role: 'admin' };
    const container = document.createElement('div');
    ReactDOM.render(
      <MemoryRouter initialEntries={['/admin']}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <div>Admin</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
      container,
    );
    expect(container.textContent).toBe('Admin');
  });
});
