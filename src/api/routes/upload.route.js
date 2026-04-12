const { Router } = require('express');
const upload = require('../middlewares/multer.middleware');
const { uploadFile } = require('../controllers/upload.controller');

const router = Router();
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 uploads per user
  keyGenerator: (req) => req.headers['x-user-id'] || 'anonymous',
  message: { error: 'TOO_MANY_REQUESTS', message: 'Upload limit exceeded. Max 10 per hour.' }
});

// POST /api/v1/upload
// multer runs first (saves file), then the controller validates headers and enqueues
router.post('/', uploadLimiter, upload.single('file'), uploadFile);

module.exports = router;
