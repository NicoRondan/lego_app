// src/shared/middlewares.js
// Common Express middleware functions used across the application. Includes
// authentication middleware for decoding JWTs and populating req.user as
// well as an error handler that formats exceptions consistently.

const jwt = require('jsonwebtoken');
const { User } = require('../infra/models');

// Authentication middleware: reads the bearer token from the Authorization
// header and decodes it using the secret. If valid, attaches a minimal
// user object (containing id) to the request. Failure to authenticate
// silently results in an anonymous request.
async function authMiddleware(req, _res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.split(' ')[1];
  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      // Lazily load user details if needed
      const userId = decoded.userId;
      req.user = { id: userId };
    } catch (err) {
      // Invalid token: ignore and proceed as anonymous
      req.user = null;
    }
  }
  return next();
}

// Centralised error handler: catches any errors thrown in routes or
// resolvers and sends a formatted JSON response with appropriate status.
function errorHandler(err, req, res, _next) {
  // GraphQL errors are handled by Apollo, but this catches Express errors
  console.error(err);
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}

module.exports = {
  authMiddleware,
  errorHandler,
};