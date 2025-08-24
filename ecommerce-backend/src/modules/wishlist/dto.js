const { ApiError } = require('../../shared/errors');

function parseAddItem(body) {
  const { productId } = body;
  const pid = parseInt(productId, 10);
  if (isNaN(pid)) throw new ApiError('productId is required', 400);
  return { productId: pid };
}

module.exports = { parseAddItem };
