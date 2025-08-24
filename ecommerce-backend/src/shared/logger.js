// src/shared/logger.js
// Logging utility using pino with graceful fallback to console when pino is not
// installed. Exposes helper methods and the raw logger instance.

let pino;
try {
  // Dynamically require so tests can run even if pino isn't installed
  pino = require('pino');
} catch (err) {
  pino = () => ({
    child: () => ({ info: console.log, warn: console.warn, error: console.error }),
    info: console.log,
    warn: console.warn,
    error: console.error,
  });
}

const logger = pino();

function log(...args) {
  logger.info(...args);
}

function warn(...args) {
  logger.warn(...args);
}

function error(...args) {
  logger.error(...args);
}

module.exports = { logger, log, warn, error };