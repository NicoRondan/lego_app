import React, { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState(null);

  const fetchCart = async () => {
    if (!user) {
      setCart(null);
      return;
    }
    try {
      const data = await api.getCart();
      setCart(data);
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
    const data = await api.addToCart({ productId, quantity });
    setCart(data);
  };

  const updateItem = async (itemId, { quantity }) => {
    const data = await api.updateCartItem(itemId, { quantity });
    setCart(data);
  };

  const removeItem = async (itemId) => {
    const data = await api.removeCartItem(itemId);
    setCart(data);
  };

  return (
    <CartContext.Provider value={{ cart, fetchCart, addItem, updateItem, removeItem }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);

