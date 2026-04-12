const { Redis } = require('ioredis');
const logger = require('../utils/logger');
const env = require('./env');

// BullMQ requires a separate connection per usage (queue vs worker vs events)
// We export a factory so callers can create their own connection.
function createRedisClient() {
  const client = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null, // required by BullMQ
    enableReadyCheck: false,
  });

  client.on('connect', () => logger.info('Redis connected'));
  client.on('error', (err) => logger.error({ err: err.message }, 'Redis error'));

  return client;
}

// Shared client for general use (non-BullMQ)
const redisClient = createRedisClient();

module.exports = { redisClient, createRedisClient };
