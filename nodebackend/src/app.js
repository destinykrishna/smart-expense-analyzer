const express = require('express');
const uploadRouter = require('./api/routes/upload.route');
const jobRouter = require('./api/routes/job.route');
const { errorMiddleware } = require('./api/middlewares/error.middleware');
const logger = require('./utils/logger');

const app = express();

const mongoose = require('mongoose');
const { redisClient } = require('./config/redis');
const { createBullBoard } = require('@bull-board/api');
const { BullMQAdapter } = require('@bull-board/api/bullMQAdapter');
const { ExpressAdapter } = require('@bull-board/express');
const { expenseQueue } = require('./queues/expense.queue');

// ── Bull Board Setup ─────────────────────────────────────────────────────────
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [new BullMQAdapter(expenseQueue)],
  serverAdapter,
});

// ── Built-in middleware ──────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Health check (deep ping) ────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    const mongoState = mongoose.connection.readyState;
    const mongoStatus = mongoState === 1 ? 'connected' : 'disconnected';
    const redisPing = await redisClient.ping().catch(() => 'error');
    const redisStatus = redisPing === 'PONG' ? 'connected' : 'disconnected';

    const code = (mongoStatus === 'connected' && redisStatus === 'connected') ? 200 : 503;
    res.status(code).json({
      status: code === 200 ? 'ok' : 'error',
      service: 'smart-expense-api',
      mongo: mongoStatus,
      redis: redisStatus,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    res.status(503).json({ status: 'error', message: err.message });
  }
});

// ── API routes & Bull Board ──────────────────────────────────────────────────
app.use('/admin/queues', serverAdapter.getRouter());
app.use('/api/v1/upload', uploadRouter);
app.use('/api/v1/jobs', jobRouter);

// ── 404 handler ──────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'NOT_FOUND', message: 'The requested route does not exist.' });
});

// ── Centralised error handler (MUST be last) ─────────────────────────────────
app.use(errorMiddleware);

logger.info('Express app configured');

module.exports = app;
