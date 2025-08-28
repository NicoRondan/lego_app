import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as api from '../services/api';
import { useAuth } from './AuthContext';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState(null);
  const [pulse, setPulse] = useState(false); // short-lived flag used for header badge animation
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!user || user.role !== 'customer') { setWishlist(null); return null; }
    setLoading(true);
    try {
      const wl = await api.getWishlist().catch(() => null);
      setWishlist(wl || { items: [] });
      return wl;
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const add = useCallback(async (productId) => { await api.addToWishlist(productId); await refresh(); setPulse(true); setTimeout(() => setPulse(false), 700); }, [refresh]);
  const removeItem = useCallback(async (itemId) => { await api.removeFromWishlist(itemId); await refresh(); }, [refresh]);
  const removeByProduct = useCallback(async (productId) => {
    const wl = wishlist || (await refresh());
    const item = wl?.items?.find((it) => (it.product?.id === productId || it.productId === productId));
    if (item) await removeItem(item.id);
  }, [wishlist, refresh, removeItem]);

  const value = useMemo(() => ({
    wishlist: wishlist || { items: [] },
    items: wishlist?.items || [],
    count: wishlist?.items?.length || 0,
    loading,
    refresh,
    add,
    removeItem,
    removeByProduct,
    pulse,
    isInWishlist: (pid) => !!(wishlist?.items?.some((it) => (it.product?.id === pid || it.productId === pid))),
  }), [wishlist, loading, refresh, add, removeItem, removeByProduct, pulse]);

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext) || { items: [], count: 0, add: async () => {}, removeItem: async () => {}, refresh: async () => {} };
}
