import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from './AuthContext';
import { withItemsCount } from '../utils/cart';

const REQUIRE_AUTH = process.env.REACT_APP_CART_REQUIRE_AUTH !== 'false';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(null);

  // Wraps setCart to recompute summary.itemsCount as the sum of item quantities.
  const setCartWithCount = (dataOrUpdater) => {
    setCart((prev) =>
      withItemsCount(
        typeof dataOrUpdater === 'function' ? dataOrUpdater(prev) : dataOrUpdater,
      ),
    );
  };

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const data = await api.getCart();
      setCartWithCount(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const addItem = async ({ productId, quantity }) => {
    if (REQUIRE_AUTH && !user) {
      navigate('/login', { state: { redirectTo: location.pathname + location.search } });
      return;
    }
    // Optimistically bump summary count so badge updates immediately.
    setCart((prev) => {
      if (!prev) return prev;
      const itemsCount = (prev.summary?.itemsCount || 0) + quantity;
      return { ...prev, summary: { ...(prev.summary || {}), itemsCount } };
    });
    try {
      const data = await api.addToCart({ productId, quantity });
      setCartWithCount(data);
    } catch (err) {
      // Revert optimistic update on failure
      await fetchCart();
      throw err;
    }
  };

  const updateItem = async (itemId, { quantity }) => {
    // Optimistically update selected item's quantity and summary.
    setCartWithCount((prev) => {
      if (!prev) return prev;
      const items = (prev.items || []).map((it) =>
        it.id === itemId ? { ...it, quantity } : it,
      );
      return { ...prev, items };
    });
    try {
      const data = await api.updateCartItem(itemId, { quantity });
      setCartWithCount(data);
    } catch (err) {
      // Fetch cart to revert if server rejects update (e.g., out of stock)
      await fetchCart();
      throw err;
    }
  };

  const removeItem = async (itemId) => {
    // Remove locally so UI updates without waiting for server.
    setCartWithCount((prev) => {
      if (!prev) return prev;
      const items = (prev.items || []).filter((it) => it.id !== itemId);
      return { ...prev, items };
    });
    const data = await api.removeCartItem(itemId);
    setCartWithCount(data);
  };

  const clearCart = async () => {
    await api.clearCart();
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, fetchCart, addItem, updateItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

