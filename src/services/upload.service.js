const path = require('path');
const crypto = require('crypto');
const { validateCsvHeaders } = require('../utils/csv.validator');
const Job = require('../models/job.model');
const { enqueueExpenseJob } = require('../queues/expense.queue');
const logger = require('../utils/logger');

/**
 * Validates the file headers synchronously before creating any DB record.
 * Creates the Job document (status: pending) and enqueues the BullMQ job.
 *
 * @param {string} filePath     - Absolute path to the saved CSV
 * @param {string} originalName - Original client filename
 * @param {string} userId       - ID of the uploading user
 * @returns {Promise<{ jobId: string }>}
 */
async function initiateUpload(filePath, originalName, userId) {
  // 1. Validate CSV headers BEFORE touching the queue
  const { valid, missingColumns } = await validateCsvHeaders(filePath);

  if (!valid) {
    const err = new Error(`CSV is missing required columns: ${missingColumns.join(', ')}`);
    err.status = 400;
    throw err;
  }

  // 2. Create a stable jobId
  const jobId = crypto.randomUUID();

  // 3. Persist Job document (status: pending)
  await Job.create({
    jobId,
    userId,
    filePath,
    originalName,
    status: 'pending',
  });

  // 4. Enqueue BullMQ job (idempotent — uses jobId as BullMQ job ID)
  await enqueueExpenseJob(jobId, filePath, userId);

  logger.info({ jobId, userId, originalName }, 'Job enqueued successfully');

  return { jobId };
}

module.exports = { initiateUpload };
