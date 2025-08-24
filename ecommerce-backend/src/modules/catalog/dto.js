// Data transfer objects and validation for catalog module
const { ApiError } = require('../../shared/errors');

function parseGetProducts(query) {
  const { search, theme, minPrice, maxPrice, page, limit, order } = query;
  const result = {};
  if (search !== undefined) result.search = String(search);
  if (theme !== undefined) result.theme = String(theme);
  if (minPrice !== undefined) {
    const value = parseFloat(minPrice);
    if (isNaN(value)) throw new ApiError('minPrice must be a number', 400);
    result.minPrice = value;
  }
  if (maxPrice !== undefined) {
    const value = parseFloat(maxPrice);
    if (isNaN(value)) throw new ApiError('maxPrice must be a number', 400);
    result.maxPrice = value;
  }
  if (page !== undefined) {
    const value = parseInt(page, 10);
    if (isNaN(value) || value < 1) throw new ApiError('page must be positive integer', 400);
    result.page = value;
  }
  if (limit !== undefined) {
    const value = parseInt(limit, 10);
    if (isNaN(value) || value < 1) throw new ApiError('limit must be positive integer', 400);
    result.limit = value;
  }
  if (order !== undefined) result.order = String(order);
  return result;
}

module.exports = { parseGetProducts };
