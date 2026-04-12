const mongoose = require('mongoose');
const logger = require('../utils/logger');
const env = require('./env');

let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  try {
    await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });
    isConnected = true;
    logger.info('MongoDB connected successfully');
  } catch (err) {
    logger.error({ err: err.message }, 'MongoDB connection failed');
    process.exit(1); // fail fast
  }
}

async function disconnectDB() {
  if (!isConnected) return;
  await mongoose.disconnect();
  isConnected = false;
  logger.info('MongoDB disconnected');
}

module.exports = { connectDB, disconnectDB };
