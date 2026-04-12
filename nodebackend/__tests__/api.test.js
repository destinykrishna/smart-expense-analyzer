process.env.NODE_ENV = 'test';
const request = require('supertest');
const app = require('../src/app');
const jobService = require('../src/services/job.service');
const uploadService = require('../src/services/upload.service');

// Mock the services so we don't need real Redis/Mongo to test the API boundary
jest.mock('../src/services/job.service');
jest.mock('../src/services/upload.service');

// We also need to mock Redis ping for the healthcheck
jest.mock('../src/config/redis', () => ({
  redisClient: {
    ping: jest.fn().mockResolvedValue('PONG'),
  },
  createRedisClient: jest.fn(),
}));

// Mock Mongoose connection state
const mongoose = require('mongoose');
Object.defineProperty(mongoose, 'connection', {
  value: { readyState: 1 }, // 1 = connected
});

describe('API Routes Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 and healthy status when connections are up', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('ok');
      expect(response.body.mongo).toBe('connected');
      expect(response.body.redis).toBe('connected');
    });
  });

  describe('GET /api/v1/jobs/:jobId', () => {
    it('should return 404 if job is not found', async () => {
      jobService.getJobStatus.mockResolvedValue(null);

      const response = await request(app).get('/api/v1/jobs/123');
      expect(response.status).toBe(404);
      expect(response.body.error).toBe('JOB_NOT_FOUND');
    });

    it('should return 200 and job status if found', async () => {
      jobService.getJobStatus.mockResolvedValue({ status: 'processing', progress: 50 });

      const response = await request(app).get('/api/v1/jobs/123');
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('processing');
    });
  });

  describe('GET /api/v1/jobs/:jobId/transactions', () => {
    it('should return paginated transactions', async () => {
      jobService.getTransactions.mockResolvedValue({
        transactions: [{ id: 'txn1', amount: -10 }],
        pagination: { page: 1, limit: 50, total: 1, pages: 1 }
      });

      const response = await request(app).get('/api/v1/jobs/123/transactions?page=1');
      expect(response.status).toBe(200);
      expect(response.body.transactions.length).toBe(1);
      expect(response.body.pagination.total).toBe(1);
    });
  });

  describe('POST /api/v1/upload', () => {
    it('should return 400 if no file is uploaded', async () => {
      const response = await request(app).post('/api/v1/upload');
      expect(response.status).toBe(400);
      expect(response.body.error).toBe('NO_FILE');
    });
  });
});
