const { Router } = require('express');
const { getJobStatus, getJobTransactions } = require('../controllers/job.controller');

const router = Router();

// GET /api/v1/jobs/:jobId
router.get('/:jobId', getJobStatus);

// GET /api/v1/jobs/:jobId/transactions?page=1&limit=50&category=Food
router.get('/:jobId/transactions', getJobTransactions);

module.exports = router;
