const logger = require('../../utils/logger');

/**
 * Centralised Express error handler.
 * Must be registered LAST in app.js (after all routes).
 *
 * Maps known operational errors to appropriate HTTP codes.
 * Unknown errors are treated as 500 Internal Server Errors.
 */
// eslint-disable-next-line no-unused-vars
function errorMiddleware(err, req, res, _next) {
  // Multer errors (file size, wrong mime type)
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'FILE_TOO_LARGE', message: err.message });
  }

  if (err.message === 'Only .csv files are accepted') {
    return res.status(415).json({ error: 'UNSUPPORTED_FILE_TYPE', message: err.message });
  }

  // Validation errors forwarded from controllers
  if (err.status === 400) {
    return res.status(400).json({ error: 'BAD_REQUEST', message: err.message });
  }

  // Generic 500 — log stack trace for internal investigation
  logger.error({ url: req.url, method: req.method, err: err.message, stack: err.stack }, 'Unhandled error');

  return res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred. Please try again later.',
  });
}

module.exports = { errorMiddleware };
