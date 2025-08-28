import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [loading, setLoading] = useState(false);

  const refresh = async () => {
    if (!user || user.role !== 'customer') { setWishlist(null); return null; }
    setLoading(true);
    try {
      const wl = await api.getWishlist().catch(() => null);
      setWishlist(wl || { items: [] });
      return wl;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [user?.id]);

  const add = async (productId) => { await api.addToWishlist(productId); await refresh(); };
  const removeItem = async (itemId) => { await api.removeFromWishlist(itemId); await refresh(); };
  const removeByProduct = async (productId) => {
    const wl = wishlist || (await refresh());
    const item = wl?.items?.find((it) => (it.product?.id === productId || it.productId === productId));
    if (item) await removeItem(item.id);
  };

  const value = useMemo(() => ({
    wishlist: wishlist || { items: [] },
    items: wishlist?.items || [],
    count: wishlist?.items?.length || 0,
    loading,
    refresh,
    add,
    removeItem,
    removeByProduct,
    isInWishlist: (pid) => !!(wishlist?.items?.some((it) => (it.product?.id === pid || it.productId === pid))),
  }), [wishlist, loading]);

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext) || { items: [], count: 0, add: async () => {}, removeItem: async () => {}, refresh: async () => {} };
}

