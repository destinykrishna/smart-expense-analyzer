# Smart Expense Analyzer – Frontend API Contract

This document outlines the REST API contracts required to build the frontend application. These endpoints form the bridge between your UI (or an AI like Dora AI) and the Node.js backend cluster.

---

## 🌐 Global Configuration
- **Base URL:** `http://localhost:3000/api/v1`
- **Authentication:** All requests **must** include the following header:
  - `x-user-id: <user_id>` *(e.g., `12345` — used to isolate job data per user)*

---

## 📍 1. Upload CSV
Upload a bank statement / transaction list to be analyzed.

- **URL:** `/upload`
- **Method:** `POST`
- **Content-Type:** `multipart/form-data`

### Request Payload
| Key | Type | Description |
|---|---|---|
| `file` | `File` | A valid `.csv` file containing `id`, `date`, `description`, `amount` |

### Success Response (`202 Accepted`)
The backend does not wait for the ML service to finish. It immediately returns a `jobId` so the UI can show a loading/polling state.
```json
{
  "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "status": "pending",
  "message": "File accepted. Poll GET /api/v1/jobs/:jobId for status."
}
```

### Error Scenarios
- `400 Bad Request` — Missing file, or CSV is missing required column headers.
- `415 Unsupported Media Type` — Uploaded file is not a `.csv`.
- `429 Too Many Requests` — More than 10 uploads in 1 hour.

---

## 📍 2. Poll Job Status
Use this to update the UI progress bar. Fetch every ~3 seconds until status is `completed` or `failed`.

- **URL:** `/jobs/:jobId`
- **Method:** `GET`

### Path Parameter
| Parameter | Description |
|---|---|
| `jobId` | The UUID returned from the `/upload` endpoint |

### Success Response (`200 OK`)
```json
{
  "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
  "userId": "12345",
  "status": "processing",  // ENUMS: pending | processing | completed | failed
  "progress": 60,          // 0 to 100
  "rowCount": 254,         // Total rows extracted from the CSV
  "createdAt": "2026-04-12T10:00:00.000Z"
}
```
*Note: If `status` represents `completed`, the response will also include a `summary` object containing total, categorized, and lowConfidence aggregates.*

---

## 📍 3. Fetch Job Transactions (Results)
Once the job `status` changes to `completed` from the polling endpoint, use this endpoint to fetch the actual categorized data to display in a table or dashboard graph.

- **URL:** `/jobs/:jobId/transactions`
- **Method:** `GET`

### Query Parameters (Optional)
| Parameter | Default | Description |
|---|---|---|
| `page` | `1` | Pagination page number |
| `limit` | `50` | Items per page (max 200) |
| `category` | `null` | Filter by an ML-assigned string (e.g., `Food`) |

### Success Response (`200 OK`)
```json
{
  "transactions": [
    {
      "txnId": "txn_10923",
      "date": "2026-04-01T00:00:00.000Z",
      "description": "STARBUCKS STORE 123",
      "amount": -5.99,
      "currency": "USD",
      "category": "Food & Dining",
      "subcategory": "Coffee Shops",
      "confidence": 0.98,
      "tags": ["recurring"],
      "isLowConfidence": false
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 254,
    "pages": 6
  }
}
```

---

## 📍 4. System Health (Optional)
Used by the frontend to check if the backend network is alive before allowing the user to begin interacting.

- **URL:** `http://localhost:3000/health`
- **Method:** `GET`

### Success Response (`200 OK`)
```json
{
  "status": "ok",
  "service": "smart-expense-api",
  "mongo": "connected",
  "redis": "connected",
  "timestamp": "2026-04-12T10:05:00.000Z"
}
```
