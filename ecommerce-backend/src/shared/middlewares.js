// src/shared/middlewares.js
// Common Express middleware functions used across the application. Includes
// authentication middleware for decoding JWTs and populating req.user as
// well as an error handler that formats exceptions consistently.

const jwt = require('jsonwebtoken');
const { randomUUID } = require('crypto');
const { logger } = require('./logger');
const { ERROR_CODES } = require('./errors');

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
      req.user = { id: decoded.userId, role: decoded.role };
    } catch (err) {
      // Invalid token: ignore and proceed as anonymous
      req.user = null;
    }
  }
  return next();
}

// Simple cookie parser to populate req.cookies
function parseCookies(req, _res, next) {
  req.cookies = {};
  const header = req.headers.cookie;
  if (header) {
    header.split(';').forEach((part) => {
      const [key, ...v] = part.trim().split('=');
      req.cookies[key] = decodeURIComponent(v.join('='));
    });
  }
  next();
}

// Basic in-memory rate limiter per IP
function rateLimit({ windowMs, limit }) {
  const hits = new Map();
  return function (req, res, next) {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    let record = hits.get(ip);
    if (!record || record.reset < now) {
      record = { count: 0, reset: now + windowMs };
    }
    record.count += 1;
    hits.set(ip, record);
    if (record.count > limit) {
      return res
        .status(429)
        .json({ error: { code: ERROR_CODES[429], message: 'Rate limit exceeded' }, requestId: req.id });
    }
    next();
  };
}

// Authorization middleware for role-based access control
function requireRole(role) {
  return function (req, res, next) {
    if (!req.user || req.user.role !== role) {
      return res
        .status(403)
        .json({ error: { code: ERROR_CODES[403], message: 'Forbidden' }, requestId: req.id });
    }
    next();
  };
}

// Request ID and logger middleware: assigns a unique requestId and binds a
// child logger to the request for correlation across logs.
function requestIdMiddleware(req, res, next) {
  const id = req.headers['x-request-id'] || randomUUID();
  req.id = id;
  res.setHeader('x-request-id', id);
  req.log = logger.child({ requestId: id });
  next();
}

// Centralised error handler: catches any errors thrown in routes or
// resolvers and sends a formatted JSON response with appropriate status and code.
function errorHandler(err, req, res, _next) {
  const status = err.status || 500;
  const code = err.code || ERROR_CODES[status] || 'INTERNAL_SERVER_ERROR';
  const message = err.message || 'Internal Server Error';
  if (req.log && req.log.error) {
    req.log.error({ err }, message);
  } else {
    // eslint-disable-next-line no-console
    console.error(err);
  }
  res.status(status).json({
    error: { code, message },
    requestId: req.id,
  });
}

module.exports = {
  authMiddleware,
  requestIdMiddleware,
  errorHandler,
  parseCookies,
  rateLimit,
  requireRole,
};