// src/services/api.js
// Helper functions to interact with the backend API. These functions use
// the Fetch API to call REST endpoints defined in the backend. All requests
// funnel through a central helper that adds the Authorization header when a
// JWT token is available, performs basic error handling, selective retries
// and surfaces errors via toast notifications.

import { toast } from 'react-toastify';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

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

async function request(path, { method = 'GET', headers = {}, body, token } = {}) {
  const url = `${API_URL}${path}`;
  const opts = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };
  const authToken = token || localStorage.getItem('token');
  if (authToken) {
    opts.headers['Authorization'] = `Bearer ${authToken}`;
  }
  if (body) {
    opts.body = JSON.stringify(body);
  }
  try {
    const resp = await fetchWithRetry(url, opts, 1);
    const text = await resp.text();
    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return {};
    }
  } catch (err) {
    toast.error(err.message || 'Request failed');
    throw err;
  }
}

// Authentication
export async function login({ provider, providerId, name, email }) {
  return await request('/auth/login', {
    method: 'POST',
    body: { provider, providerId, name, email },
  });
}

// Fetch current user info via GraphQL (me query)
export async function getMe(token) {
  // Use GraphQL to fetch me (id, name, email)
  const query = {
    query: `query { me { id name email } }`,
    variables: {},
  };
  const resp = await fetch(`${API_URL}/graphql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(query),
  });
  if (!resp.ok) throw new Error('Failed to fetch user');
  const json = await resp.json();
  return json.data.me;
}

// Products
export async function getProducts({
  search = '',
  theme = '',
  minPrice = '',
  maxPrice = '',
  page = 1,
  limit = 10,
  order = 'price_asc',
} = {}) {
  const params = new URLSearchParams();
  if (search) params.set('search', search);
  if (theme) params.set('theme', theme);
  if (minPrice) params.set('minPrice', minPrice);
  if (maxPrice) params.set('maxPrice', maxPrice);
  if (page) params.set('page', page);
  if (limit) params.set('limit', limit);
  if (order) params.set('order', order);
  const queryString = params.toString();
  const path = '/products' + (queryString ? `?${queryString}` : '');
  return await request(path, { method: 'GET' });
}

export async function getProductById(id) {
  return await request(`/products/${id}`, { method: 'GET' });
}

export async function getCategories() {
  return await request('/categories', { method: 'GET' });
}

// Cart
export async function getCart(token) {
  return await request('/cart', { method: 'GET', token });
}

export async function addToCart({ productId, quantity }, token) {
  return await request('/cart/items', { method: 'POST', body: { productId, quantity }, token });
}

export async function updateCartItem(itemId, { quantity }, token) {
  return await request(`/cart/items/${itemId}`, { method: 'PATCH', body: { quantity }, token });
}

export async function removeCartItem(itemId, token) {
  return await request(`/cart/items/${itemId}`, { method: 'DELETE', token });
}

// Orders
export async function createOrder({ couponCode } = {}, token) {
  return await request('/orders', { method: 'POST', body: { couponCode }, token });
}

export async function getOrders(token) {
  return await request('/orders', { method: 'GET', token });
}

// Payments
export async function createPaymentPreference(orderId, token) {
  return await request('/payments/mp/preference', { method: 'POST', body: { orderId }, token });
}

// Wishlist
export async function getWishlist(token) {
  return await request('/wishlist', { method: 'GET', token });
}

export async function addToWishlist(productId, token) {
  return await request('/wishlist/items', { method: 'POST', body: { productId }, token });
}

export async function removeFromWishlist(itemId, token) {
  return await request(`/wishlist/items/${itemId}`, { method: 'DELETE', token });
}

// Reviews
export async function createReview(productId, { rating, comment }, token) {
  return await request(`/products/${productId}/reviews`, {
    method: 'POST',
    body: { rating, comment },
    token,
  });
}

// Note: webhooks are handled server-side; no client function needed