// src/shared/errors.js
// Custom error classes used for API responses. Use ApiError to set both
// message and HTTP status code when throwing errors from controllers.

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

module.exports = { ApiError };