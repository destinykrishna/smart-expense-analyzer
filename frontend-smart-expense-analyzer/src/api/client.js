import axios from 'axios';

const API_BASE = 'http://localhost:3000/api/v1';
const ROOT_BASE = 'http://localhost:3000';

const getUserId = () => localStorage.getItem('userId') || 'demo-user-001';

const client = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
});

client.interceptors.request.use((config) => {
  config.headers['x-user-id'] = getUserId();
  return config;
});

const rootClient = axios.create({ baseURL: ROOT_BASE });

// ── Health ──────────────────────────────────────────────────────────────────
export const checkHealth = async () => {
  const { data } = await rootClient.get('/health');
  return data;
};

// ── Upload CSV ───────────────────────────────────────────────────────────────
export const uploadCSV = async (file, userId) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await client.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      'x-user-id': userId || getUserId(),
    },
  });
  return data; // { jobId, status, message }
};

// ── Poll Job Status ──────────────────────────────────────────────────────────
export const pollJobStatus = async (jobId) => {
  const { data } = await client.get(`/jobs/${jobId}`, {
    headers: { 'x-user-id': getUserId() },
  });
  return data; // { jobId, userId, status, progress, rowCount, createdAt }
};

// ── Fetch Transactions ───────────────────────────────────────────────────────
export const fetchTransactions = async (jobId, { page = 1, limit = 50, category } = {}) => {
  const params = { page, limit };
  if (category) params.category = category;
  const { data } = await client.get(`/jobs/${jobId}/transactions`, {
    params,
    headers: { 'x-user-id': getUserId() },
  });
  return data; // { transactions, pagination }
};
