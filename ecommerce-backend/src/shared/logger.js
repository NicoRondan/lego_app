// src/shared/logger.js
// Simple logging utility wrapping console with different levels. In a real
// application you might replace this with a library like pino or winston.

function log(...args) {
  // eslint-disable-next-line no-console
  console.log('[LOG]', ...args);
}

function warn(...args) {
  // eslint-disable-next-line no-console
  console.warn('[WARN]', ...args);
}

function error(...args) {
  // eslint-disable-next-line no-console
  console.error('[ERROR]', ...args);
}

module.exports = { log, warn, error };