import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react';
import { CartProvider, useCart } from './CartContext';
import * as api from '../services/api';

jest.mock('../services/api');

const mockNavigate = jest.fn();
const location = { pathname: '/catalog', search: '' };
let mockUser = null;

jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: mockUser }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => location,
}));

let contextRef;
function Consumer() {
  contextRef = useCart();
  return null;
}

describe('CartContext', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    mockUser = null;
    api.addToCart.mockResolvedValue({ items: [], summary: {} });
    api.getCart = jest.fn().mockResolvedValue({ items: [], summary: {} });
  });

  async function renderWithProvider() {
    const container = document.createElement('div');
    await act(async () => {
      ReactDOM.render(
        <CartProvider>
          <Consumer />
        </CartProvider>,
        container,
      );
    });
    return container;
  }

  it('redirects to login when adding item without user', async () => {
    await renderWithProvider();
    await act(async () => {
      await contextRef.addItem({ productId: 1, quantity: 2 });
    });
    expect(mockNavigate).toHaveBeenCalledWith('/login', { state: { redirectTo: '/catalog' } });
  });

  it('adds items and updates count when user authenticated', async () => {
    mockUser = { id: 1 };
    api.addToCart.mockResolvedValue({
      items: [{ id: 1, quantity: 2 }],
      summary: {},
    });
    await renderWithProvider();
    await act(async () => {
      await contextRef.addItem({ productId: 1, quantity: 2 });
    });
    expect(api.addToCart).toHaveBeenCalledWith({ productId: 1, quantity: 2 });
    expect(contextRef.cart.summary.itemsCount).toBe(2);
  });
});
