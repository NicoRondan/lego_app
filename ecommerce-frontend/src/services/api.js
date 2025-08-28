import { toast } from 'react-toastify';

export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';
// eslint-disable-next-line no-console
console.debug('[api] Base URL:', API_URL);

function getCsrfToken() {
  const match = document.cookie.match(/csrfToken=([^;]+)/);
  return match ? match[1] : null;
}

async function fetchWithRetry(url, opts, retries = 1) {
  try {
    const resp = await fetch(url, opts);
    if (!resp.ok) {
      if (resp.status >= 500 && retries > 0) {
        return fetchWithRetry(url, opts, retries - 1);
      }
      const errText = await resp.text();
      throw new Error(errText || resp.statusText);
    }
    return resp;
  } catch (err) {
    if (retries > 0) {
      return fetchWithRetry(url, opts, retries - 1);
    }
    throw err;
  }
}

async function request(path, { method = 'GET', headers = {}, body } = {}) {
  const url = `${API_URL}${path}`;
  const opts = {
    method,
    headers: { ...headers },
    credentials: 'include',
  };
  if (body) {
    opts.headers['Content-Type'] = 'application/json';
    opts.body = JSON.stringify(body);
  }
  if (['POST', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    const csrf = getCsrfToken();
    if (csrf) opts.headers['X-CSRF-Token'] = csrf;
  }
  try {
    const resp = await fetchWithRetry(url, opts, 1);
    const text = await resp.text();
    return text ? JSON.parse(text) : {};
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[api] Request failed:', err);
    toast.error(err.message || 'Request failed');
    throw err;
  }
}

// Auth
export const register = ({ name, email, password }) =>
  request('/auth/register', { method: 'POST', body: { name, email, password } });

export const login = ({ email, password }) =>
  request('/auth/login', { method: 'POST', body: { email, password } });

export const logout = () => request('/auth/logout', { method: 'POST' });

export const refresh = () => request('/auth/refresh', { method: 'POST' });

export const getMe = () => request('/auth/me');

// Products
export const getProducts = ({
  search = '',
  theme = '',
  minPrice = '',
  maxPrice = '',
  featured = '',
  page = 1,
  limit = 10,
  order = 'price_asc',
} = {}) => {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (theme) params.set('theme', theme);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (featured) params.set('featured', featured);
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);
  if (order) params.set('order', order);
  const queryString = params.toString();
  const path = '/products' + (queryString ? `?${queryString}` : '');
  return request(path);
};

export const getProductById = (id) => request(`/products/${id}`);

export const getCategories = () => request('/categories');

export const createProduct = (data) =>
  request('/products', { method: 'POST', body: data });

// Reviews
export const getReviews = ({ limit = 10 } = {}) => {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  const query = params.toString();
  return request('/reviews' + (query ? `?${query}` : ''));
};

// Newsletter
export const subscribeNewsletter = (email) =>
  request('/api/newsletter', { method: 'POST', body: { email } });

// Cart
export const getCart = () => request('/cart');

export const addToCart = ({ productId, quantity }) =>
  request('/cart/items', { method: 'POST', body: { productId, quantity } });

export const updateCartItem = (itemId, { quantity }) =>
  request(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity } });

export const removeCartItem = (itemId) =>
  request(`/cart/items/${itemId}`, { method: 'DELETE' });

export const clearCart = () => request('/cart', { method: 'DELETE' });

// Cart coupons
export const cartApplyCoupon = (code) =>
  request('/cart/apply-coupon', { method: 'POST', body: { code } });

export const cartRemoveCoupon = () => request('/cart/coupon', { method: 'DELETE' });

// Orders
export const createOrder = ({ couponCode } = {}) =>
  request('/orders', { method: 'POST', body: { couponCode } });

export const getOrders = () => request('/orders');

// Payments
export const createPaymentPreference = (orderId) =>
  request('/payments/mp/preference', { method: 'POST', body: { orderId } });

// Wishlist
export const getWishlist = () => request('/wishlist');

export const addToWishlist = (productId) =>
  request('/wishlist/items', { method: 'POST', body: { productId } });

export const removeFromWishlist = (itemId) =>
  request(`/wishlist/items/${itemId}`, { method: 'DELETE' });

// Reviews
export const createReview = (productId, { rating, comment }) =>
  request(`/products/${productId}/reviews`, {
    method: 'POST',
    body: { rating, comment },
  });

// Admin - Orders
export const adminListOrders = ({ status = '', q = '', from = '', to = '', page = 1, pageSize = 20, format = '' } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (q) params.set('q', q);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (page) params.set('page', page);
  if (pageSize) params.set('pageSize', pageSize);
  if (format) params.set('format', format);
  const qs = params.toString();
  return request('/admin/orders' + (qs ? `?${qs}` : ''));
};

export const adminGetOrder = (id) => request(`/admin/orders/${id}`);

export const adminUpdateOrderStatus = (id, { to, note }) =>
  request(`/admin/orders/${id}/status`, { method: 'PUT', body: { to, note } });

export const adminShipOrder = (id, { carrier, tracking, eta } = {}) =>
  request(`/admin/orders/${id}/ship`, { method: 'POST', body: { carrier, tracking, eta } });

export const adminRefundOrder = (id, { amount, reason }) =>
  request(`/admin/orders/${id}/refund`, { method: 'POST', body: { amount, reason } });

export const adminGetPaymentAudit = (idOrExtId) => request(`/admin/payments/${idOrExtId}`);

// Admin - Coupons
export const adminListCoupons = ({ q = '', status = '', from = '', to = '', page = 1, pageSize = 20 } = {}) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (status) params.set('status', status);
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (page) params.set('page', page);
  if (pageSize) params.set('pageSize', pageSize);
  const qs = params.toString();
  return request('/admin/coupons' + (qs ? `?${qs}` : ''));
};

export const adminCreateCoupon = (data) => request('/admin/coupons', { method: 'POST', body: data });
export const adminUpdateCoupon = (id, data) => request(`/admin/coupons/${id}`, { method: 'PUT', body: data });
export const adminListCouponUsages = (id, { page = 1, pageSize = 20 } = {}) => {
  const params = new URLSearchParams();
  if (page) params.set('page', page);
  if (pageSize) params.set('pageSize', pageSize);
  const qs = params.toString();
  return request(`/admin/coupons/${id}/usages` + (qs ? `?${qs}` : ''));
};

// Admin - Reports
export const adminReportSalesSummary = ({ from = '', to = '', groupBy = 'day', status = 'paid,shipped,delivered', format = '' } = {}) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (groupBy) params.set('groupBy', groupBy);
  if (status) params.set('status', status);
  if (format) params.set('format', format);
  const qs = params.toString();
  return request('/admin/reports/sales/summary' + (qs ? `?${qs}` : ''));
};

export const adminReportSalesByTheme = ({ from = '', to = '', status = 'paid,shipped,delivered', format = '' } = {}) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (status) params.set('status', status);
  if (format) params.set('format', format);
  const qs = params.toString();
  return request('/admin/reports/sales/by-theme' + (qs ? `?${qs}` : ''));
};

export const adminReportTopProducts = ({ from = '', to = '', status = 'paid,shipped,delivered', limit = 10, format = '' } = {}) => {
  const params = new URLSearchParams();
  if (from) params.set('from', from);
  if (to) params.set('to', to);
  if (status) params.set('status', status);
  if (limit) params.set('limit', limit);
  if (format) params.set('format', format);
  const qs = params.toString();
  return request('/admin/reports/sales/top-products' + (qs ? `?${qs}` : ''));
};

export const adminReportLowStock = ({ threshold = 5, format = '' } = {}) => {
  const params = new URLSearchParams();
  if (threshold != null) params.set('threshold', threshold);
  if (format) params.set('format', format);
  const qs = params.toString();
  return request('/admin/reports/stock/low' + (qs ? `?${qs}` : ''));
};

// Admin - Inventory
export const adminListInventory = ({ q = '', lowStockOnly = false, page = 1, pageSize = 20 } = {}) => {
  const params = new URLSearchParams();
  if (q) params.set('q', q);
  if (lowStockOnly) params.set('lowStockOnly', 'true');
  if (page) params.set('page', page);
  if (pageSize) params.set('pageSize', pageSize);
  const qs = params.toString();
  return request('/admin/inventory' + (qs ? `?${qs}` : ''));
};

export const adminAdjustInventory = (productId, { qty, reason }) =>
  request(`/admin/inventory/${productId}/adjust`, { method: 'PATCH', body: { qty, reason } });

export const adminUpdateSafetyStock = (productId, { safetyStock }) =>
  request(`/admin/inventory/${productId}/safety`, { method: 'PUT', body: { safetyStock } });

export const adminListInventoryMovements = (productId, { limit = 20 } = {}) => {
  const params = new URLSearchParams();
  if (limit) params.set('limit', limit);
  const qs = params.toString();
  return request(`/admin/inventory/${productId}/movements` + (qs ? `?${qs}` : ''));
};
