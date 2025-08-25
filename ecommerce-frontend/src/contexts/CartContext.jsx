import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const REQUIRE_AUTH = process.env.REACT_APP_CART_REQUIRE_AUTH !== 'false';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState(null);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const data = await api.getCart();
      const itemsCount = (data?.items || []).reduce(
        (sum, it) => sum + it.quantity,
        0,
      );
      setCart({ ...data, summary: { ...(data.summary || {}), itemsCount } });
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
    await api.addToCart({ productId, quantity });
    await fetchCart();
  };

  const updateItem = async (itemId, { quantity }) => {
    await api.updateCartItem(itemId, { quantity });
    await fetchCart();
  };

  const removeItem = async (itemId) => {
    await api.removeCartItem(itemId);
    await fetchCart();
  };

  return (
    <CartContext.Provider value={{ cart, fetchCart, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

