const { ApiError } = require('../../shared/errors');

function parseAddItem(body) {
  const { productId, quantity } = body;
  const pid = parseInt(productId, 10);
  const qty = parseInt(quantity, 10);
  if (isNaN(pid)) throw new ApiError('productId is required', 400);
  if (isNaN(qty) || qty <= 0) throw new ApiError('quantity must be positive', 400);
  return { productId: pid, quantity: qty };
}

function parseUpdateItem(body) {
  const { quantity } = body;
  const qty = parseInt(quantity, 10);
  if (isNaN(qty)) throw new ApiError('quantity must be a number', 400);
  return { quantity: qty };
}

module.exports = { parseAddItem, parseUpdateItem };
