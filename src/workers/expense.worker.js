const { Worker } = require('bullmq');
const { createRedisClient } = require('../config/redis');
const mlService = require('../services/ml.service');
const { updateJobStatus, saveResults } = require('../services/job.service');
const { parseCsv } = require('../utils/csv.validator');
const logger = require('../utils/logger');
const env = require('../config/env');

const worker = new Worker(
  'expense-processing',
  async (job) => {
    const { jobId, filePath, userId } = job.data;
    logger.info({ jobId, attempt: job.attemptsMade }, 'Worker picked up job');

    // ── Step 1: Mark as processing ───────────────────────────────────────────
    await updateJobStatus(jobId, { status: 'processing', progress: 10 });
    await job.updateProgress(10);

    // ── Step 2: Parse the CSV ────────────────────────────────────────────────
    const transactions = await parseCsv(filePath);
    await updateJobStatus(jobId, { rowCount: transactions.length, progress: 30 });
    await job.updateProgress(30);

    // ── Step 3: Call ML service ──────────────────────────────────────────────
    const mlResult = await mlService.classify(jobId, transactions);
    await job.updateProgress(60);

    // Non-retryable ML error (e.g., schema mismatch) → fail immediately
    if (mlResult.error && !mlResult.retryable) {
      await updateJobStatus(jobId, { status: 'failed', error: mlResult.message, progress: 0 });
      throw new Error(`NON_RETRYABLE:${mlResult.message}`);
    }

    // ── Step 4: Persist results → MongoDB ───────────────────────────────────
    await saveResults(jobId, userId, mlResult.results, mlResult.summary, mlResult.model_version);
    await job.updateProgress(100);

    logger.info({ jobId, categorized: mlResult.summary?.categorized }, 'Job completed');
    return { categorized: mlResult.summary?.categorized };
  },
  {
    connection: createRedisClient(), // Worker needs its own connection
    concurrency: parseInt(env.WORKER_CONCURRENCY, 10) || 5,
    limiter: { max: 10, duration: 1000 }, // max 10 jobs/sec
  }
);

// ── Event handlers ──────────────────────────────────────────────────────────
worker.on('failed', async (job, err) => {
  const isNonRetryable = err.message?.startsWith('NON_RETRYABLE:');
  logger.error({ jobId: job?.data?.jobId, err: err.message, isNonRetryable }, 'Job failed');

  // If all BullMQ attempts exhausted and still not marked, update DB
  if (job?.attemptsMade >= (job?.opts?.attempts || 3) && !isNonRetryable) {
    await updateJobStatus(job.data.jobId, { status: 'failed', error: err.message }).catch(() => {});
  }
});

worker.on('completed', (job) => {
  logger.info({ jobId: job?.data?.jobId }, 'BullMQ reports job completed');
});

module.exports = worker;
