const jobService = require('../../services/job.service');

/**
 * GET /api/v1/jobs/:jobId
 * Returns status + progress for any job.
 */
async function getJobStatus(req, res, next) {
  try {
    const { jobId } = req.params;
    const job = await jobService.getJobStatus(jobId);

    if (!job) {
      return res.status(404).json({ error: 'JOB_NOT_FOUND', message: `No job found with id: ${jobId}` });
    }

    return res.status(200).json(job);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/v1/jobs/:jobId/transactions
 * Paginated list of categorised transactions for a completed job.
 * Query params: ?page=1&limit=50&category=Food
 */
async function getJobTransactions(req, res, next) {
  try {
    const { jobId } = req.params;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200); // cap at 200
    const category = req.query.category || undefined;

    const result = await jobService.getTransactions(jobId, page, limit, category);

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getJobStatus, getJobTransactions };
