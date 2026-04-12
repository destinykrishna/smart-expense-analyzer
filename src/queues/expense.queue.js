const { Queue } = require('bullmq');
const { createRedisClient } = require('../config/redis');

// Each Queue needs its own Redis connection
const expenseQueue = new Queue('expense-processing', {
  connection: createRedisClient(),
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 }, // 2s → 4s → 8s
    removeOnComplete: { count: 100 }, // keep last 100 completed jobs visible
    removeOnFail: { count: 500 },     // keep last 500 failed jobs for debugging
  },
});

/**
 * Enqueue a CSV processing job.
 * Using jobId as the BullMQ job ID ensures idempotency —
 * the same job cannot be double-enqueued.
 *
 * @param {string} jobId    - MongoDB Job document ID
 * @param {string} filePath - Absolute path to saved CSV file
 * @param {string} userId   - ID of the uploading user
 */
async function enqueueExpenseJob(jobId, filePath, userId) {
  return expenseQueue.add(
    'process-csv',
    { jobId, filePath, userId },
    { jobId } // idempotency key
  );
}

module.exports = { expenseQueue, enqueueExpenseJob };
