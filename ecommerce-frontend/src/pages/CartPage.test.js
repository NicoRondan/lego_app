import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import { act } from 'react';
import { MemoryRouter } from 'react-router-dom';
import CartPage from './CartPage';

jest.mock('../contexts/AuthContext', () => ({
  useAuth: jest.fn(),
}));

jest.mock('../contexts/CartContext', () => ({
  useCart: jest.fn(),
}));

const { useAuth } = require('../contexts/AuthContext');
const { useCart } = require('../contexts/CartContext');

describe('CartPage', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('prompts login when user not authenticated', async () => {
    useAuth.mockReturnValue({ user: null });
    useCart.mockReturnValue({});
    const container = document.createElement('div');
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>,
        container,
      );
    });
    expect(container.textContent).toMatch(/Debes iniciar sesión/);
  });

  it('renders items and allows quantity changes', async () => {
    useAuth.mockReturnValue({ user: { id: 1 } });
    const updateItem = jest.fn();
    const clearCart = jest.fn();
    useCart.mockReturnValue({
      cart: {
        summary: { itemsCount: 1 },
        items: [
          {
            id: '1',
            productId: 'p1',
            name: 'Brick Set',
            imageUrl: '/img.jpg',
            quantity: 2,
            unitPrice: '10',
            stock: 5,
          },
        ],
      },
      fetchCart: jest.fn(),
      updateItem,
      removeItem: jest.fn(),
      clearCart,
    });
    const container = document.createElement('div');
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>,
        container,
      );
    });
    expect(container.textContent).toMatch('Subtotal: $20.00');
    const incBtn = container.querySelector('button[aria-label="Incrementar cantidad"]');
    TestUtils.Simulate.click(incBtn);
    expect(updateItem).toHaveBeenCalledWith('1', { quantity: 3 });
    window.confirm = jest.fn(() => true);
    const clearBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Vaciar carrito'));
    TestUtils.Simulate.click(clearBtn);
    expect(clearCart).toHaveBeenCalled();
  });

  it('shows checkout button enabled when cart has items', async () => {
    useAuth.mockReturnValue({ user: { id: 1 } });
    useCart.mockReturnValue({
      cart: { summary: { itemsCount: 1 }, items: [] },
      fetchCart: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clearCart: jest.fn(),
    });
    const container = document.createElement('div');
    await act(async () => {
      ReactDOM.render(
        <MemoryRouter>
          <CartPage />
        </MemoryRouter>,
        container,
      );
    });
    const checkoutBtn = Array.from(container.querySelectorAll('button')).find((b) => b.textContent.includes('Proceder al pago'));
    expect(checkoutBtn.disabled).toBe(false);
  });
});
