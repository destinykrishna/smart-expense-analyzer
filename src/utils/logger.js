const winston = require('winston');
const env = require('../config/env');

const logger = winston.createLogger({
  level: env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    env.NODE_ENV === 'production'
      ? winston.format.json()        // structured JSON in prod (for log aggregators)
      : winston.format.prettyPrint() // human-readable in dev
  ),
  transports: [new winston.transports.Console()],
});

// Rule: NEVER log sensitive data (raw CSV, PII, auth tokens).
// Always log { jobId, userId, ... } context objects, never raw user data.

module.exports = logger;
