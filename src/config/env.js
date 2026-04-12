const Joi = require('joi');

require('dotenv').config();

const schema = Joi.object({
  PORT: Joi.number().default(3000),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  MONGODB_URI: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  ML_SERVICE_URL: Joi.string().uri().required(),
  ML_INTERNAL_SECRET: Joi.string().required(),
  UPLOAD_DIR: Joi.string().default('./uploads'),
  MAX_FILE_SIZE_MB: Joi.number().default(10),
  LOG_LEVEL: Joi.string().valid('error', 'warn', 'info', 'debug').default('info'),
  WORKER_CONCURRENCY: Joi.number().default(5),
}).unknown(true);

const { error, value: env } = schema.validate(process.env);

if (error) {
  throw new Error(`[Config] Invalid environment variables: ${error.message}`);
}

module.exports = env;
