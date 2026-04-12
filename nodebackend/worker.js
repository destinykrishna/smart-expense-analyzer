// worker.js — Standalone worker process (deploy independently from the API)
require('./src/config/env'); // Validate env vars at startup
const { connectDB, disconnectDB } = require('./src/config/db');
const { expenseQueue } = require('./src/queues/expense.queue');
const logger = require('./src/utils/logger');

// Importing the worker registers it — BullMQ starts processing immediately
const worker = require('./src/workers/expense.worker');

async function start() {
  await connectDB();
  logger.info({ concurrency: process.env.WORKER_CONCURRENCY || 5 }, 'Worker process started');
}

// ── Graceful shutdown ──────────────────────────────────────────────────────
async function shutdown(signal) {
  logger.info({ signal }, 'Worker shutdown signal received');

  // Pause the queue: stop accepting NEW jobs
  await expenseQueue.pause();
  logger.info('Queue paused — no new jobs will be picked up');

  // Wait for in-flight jobs to finish
  await worker.close();
  logger.info('Worker closed — all in-flight jobs finished');

  await disconnectDB();
  process.exit(0);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

start().catch((err) => {
  logger.error({ err: err.message }, 'Failed to start worker process');
  process.exit(1);
});
