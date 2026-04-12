const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');
const env = require('../../config/env');

const UPLOAD_DIR = env.UPLOAD_DIR || './uploads';
const MAX_SIZE_BYTES = (env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (req, _file, cb) => {
    // Store under uploads/{userId}/ for organisation
    const userId = req.headers['x-user-id'] || 'anonymous';
    const dir = path.join(UPLOAD_DIR, userId);
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (_req, file, cb) => {
    // {timestamp}-{randomhex}.csv — prevents path traversal attacks
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `${uniqueSuffix}.csv`);
  },
});

function csvFilter(_req, file, cb) {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Only .csv files are accepted'), false);
  }
}

const upload = multer({
  storage,
  limits: { fileSize: MAX_SIZE_BYTES },
  fileFilter: csvFilter,
});

module.exports = upload;
