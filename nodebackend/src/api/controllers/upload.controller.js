const uploadService = require('../../services/upload.service');
const logger = require('../../utils/logger');

/**
 * POST /api/v1/upload
 * Accepts a CSV file via multipart/form-data.
 * Returns jobId immediately — does NOT wait for processing.
 */
async function uploadFile(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'NO_FILE', message: 'A CSV file is required.' });
    }

    // For now userId comes from a custom header. Replace with JWT middleware later.
    const userId = req.headers['x-user-id'] || 'anonymous';

    const { jobId } = await uploadService.initiateUpload(
      req.file.path,
      req.file.originalname,
      userId
    );

    logger.info({ jobId, userId, originalName: req.file.originalname }, 'Upload accepted');

    return res.status(202).json({
      jobId,
      status: 'pending',
      message: 'File accepted. Poll GET /api/v1/jobs/:jobId for status.',
    });
  } catch (err) {
    next(err);
  }
}

module.exports = { uploadFile };
