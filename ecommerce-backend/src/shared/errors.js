// src/shared/errors.js
// Custom error classes used for API responses. Use ApiError to set both
// message and HTTP status code when throwing errors from controllers.

// Map of HTTP status codes to standard error codes
const ERROR_CODES = {
  400: 'BAD_REQUEST',
  401: 'UNAUTHORIZED',
  403: 'FORBIDDEN',
  404: 'NOT_FOUND',
  429: 'TOO_MANY_REQUESTS',
  409: 'CONFLICT',
  500: 'INTERNAL_SERVER_ERROR',
};

class ApiError extends Error {
  constructor(message, status = 400, code = ERROR_CODES[status] || 'BAD_REQUEST') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = { ApiError, ERROR_CODES };