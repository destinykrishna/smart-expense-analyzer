const axios = require('axios');
const env = require('../config/env');
const logger = require('../utils/logger');

const mlClient = axios.create({
  baseURL: env.ML_SERVICE_URL,
  timeout: 30000, // 30s — ML inference can be slow
  headers: {
    'Content-Type': 'application/json',
    'X-Internal-Key': env.ML_INTERNAL_SECRET,
  },
});

/**
 * Call the ML service to classify a batch of transactions.
 * Handles 422 (validation error) as a non-retryable failure.
 * Throws on 5xx/network errors so BullMQ can retry with backoff.
 *
 * @param {string} jobId
 * @param {Array<{ id, date, description, amount, currency }>} transactions
 * @returns {Promise<{ results, summary, model_version, processed_at } | { error, retryable, message }>}
 */
async function classify(jobId, transactions) {
  try {
    const { data } = await mlClient.post('/classify', { job_id: jobId, transactions });
    logger.info({ jobId, model_version: data.model_version, total: data.summary?.total }, 'ML classify success');
    return data;
  } catch (err) {
    if (err.response?.status === 422) {
      // Invalid payload — no point retrying
      return {
        error: 'VALIDATION_ERROR',
        retryable: false,
        message: err.response.data?.message || 'ML service rejected the payload',
      };
    }

    // 5xx or network error — let BullMQ retry
    logger.warn({ jobId, status: err.response?.status, err: err.message }, 'ML classify failed, will retry');
    throw err;
  }
}

module.exports = { classify };
