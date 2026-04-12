const Job = require('../models/job.model');
const Transaction = require('../models/transaction.model');
const logger = require('../utils/logger');

/**
 * Fetch job status for the polling endpoint.
 * @param {string} jobId
 * @returns {Promise<object|null>}
 */
async function getJobStatus(jobId) {
  return Job.findOne({ jobId }, '-_id -__v -filePath').lean();
}

/**
 * Update job status. Used by the worker.
 * @param {string} jobId
 * @param {Partial<import('../models/job.model')>} fields
 */
async function updateJobStatus(jobId, fields) {
  return Job.findOneAndUpdate({ jobId }, { $set: fields }, { new: true });
}

/**
 * Bulk-insert transaction results returned by the ML service,
 * then mark the job as completed.
 *
 * @param {string} jobId
 * @param {string} userId
 * @param {Array}  results   - ML result array from /classify response
 * @param {object} summary   - { total, categorized, lowConfidence }
 * @param {string} modelVersion
 */
async function saveResults(jobId, userId, results, summary, modelVersion) {
  if (!results || results.length === 0) return;

  const docs = results.map((r) => ({
    jobId,
    userId,
    txnId:       r.id,
    date:        new Date(), // worker enriches with original CSV date if needed
    description: '', // enriched by worker from CSV data
    amount:      0,  // enriched by worker from CSV data
    category:    r.category,
    subcategory: r.subcategory,
    confidence:  r.confidence,
    tags:        r.tags || [],
    isLowConfidence: r.confidence < 0.6,
    modelVersion,
  }));

  await Transaction.insertMany(docs, { ordered: false }); // ordered:false = partial success allowed

  await updateJobStatus(jobId, {
    status: 'completed',
    progress: 100,
    summary,
    modelVersion,
    completedAt: new Date(),
  });

  logger.info({ jobId, categorized: summary.categorized }, 'Results saved, job completed');
}

/**
 * Paginated transaction query for GET /jobs/:jobId/transactions
 * @param {string} jobId
 * @param {number} page
 * @param {number} limit
 * @param {string} [category]
 */
async function getTransactions(jobId, page = 1, limit = 50, category) {
  const filter = { jobId };
  if (category) filter.category = category;

  const skip = (page - 1) * limit;

  const [transactions, total] = await Promise.all([
    Transaction.find(filter, '-_id -__v')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Transaction.countDocuments(filter),
  ]);

  return {
    transactions,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

module.exports = { getJobStatus, updateJobStatus, saveResults, getTransactions };
