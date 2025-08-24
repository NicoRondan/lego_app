const { ApiError } = require('../../shared/errors');

function parseCreateOrder(body) {
  const { couponCode } = body || {};
  if (couponCode !== undefined && typeof couponCode !== 'string') {
    throw new ApiError('couponCode must be string', 400);
  }
  return { couponCode };
}

module.exports = { parseCreateOrder };
