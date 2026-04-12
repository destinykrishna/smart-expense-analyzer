// server.js — HTTP entry point ONLY (no worker code)
require('./src/config/env'); // Validate env vars at startup, fail fast if invalid
const app = require('./src/app');
const { connectDB } = require('./src/config/db');
const { redisClient } = require('./src/config/redis');
const logger = require('./src/utils/logger');

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDB();
  logger.info('Database connected');

  const server = app.listen(PORT, () => {
    logger.info({ port: PORT, env: process.env.NODE_ENV }, 'API server listening');
  });

  // ── Graceful shutdown ────────────────────────────────────────────────────
  async function shutdown(signal) {
    logger.info({ signal }, 'Shutdown signal received');
    server.close(async () => {
      await redisClient.quit();
      logger.info('HTTP server closed');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.error({ err: err.message }, 'Failed to start API server');
  process.exit(1);
});
