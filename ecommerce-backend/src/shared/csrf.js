// src/shared/csrf.js
// Middleware that verifies a CSRF token using the double-submit cookie pattern.
// Clients must first obtain a token from /auth/csrf which sets an HttpOnly
// cookie and returns the token. Subsequent GraphQL mutations must include the
// token in the `x-csrf-token` header which is compared against the cookie value.

const { ERROR_CODES } = require('./errors');

function csrfMiddleware(req, res, next) {
  const tokenCookie = req.cookies && req.cookies.csrfToken;
  const isMutation =
    req.method === 'POST' &&
    req.body &&
    typeof req.body.query === 'string' &&
    req.body.query.trim().startsWith('mutation');

  if (isMutation) {
    const headerToken = req.headers['x-csrf-token'];
    if (!tokenCookie || !headerToken || tokenCookie !== headerToken) {
      return res
        .status(403)
        .json({ error: { code: ERROR_CODES[403], message: 'Invalid CSRF token' }, requestId: req.id });
    }
  }
  next();
}

module.exports = csrfMiddleware;
