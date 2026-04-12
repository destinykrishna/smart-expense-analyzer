# Node.js + ML Integration & Testing Guide

This guide covers how to test your code locally (using Jest and Postman) and exactly how to wire up your backend with the ML Engineer's backend.

---

## 🧪 1. Local Automated Testing (Jest)
You are using `jest` and `supertest` to validate the Node.js API boundary automatically. We have configured **Service Mocks** in your tests, meaning you do NOT need Redis, MongoDB, or the ML server running to pass these tests!

**How to run it:**
1. Open your terminal in the root folder.
2. Run the command: `npm test`
3. Jest will rapidly verify your routes and logic without touching the actual databases.

---

## 🚀 2. API Manual Testing (Postman Guide)

Before fully integrating with the ML Server, you should test that your Node APIs accept endpoints properly use Postman. 

**Setup Requirements:**
- MongoDB and Redis must be running locally.
- In terminal 1, run: `npm start`
- *(Optional)* In terminal 2, run: `npm run start:worker` (leave this off if you just want to test if uploads are accepted without processing them).

### 📍 Route 1: System Health (Deep Ping)
- **Method:** `GET`
- **URL:** `http://localhost:3000/health`
- **Expected Output:**
  ```json
  {
    "status": "ok",
    "service": "smart-expense-api",
    "mongo": "connected",
    "redis": "connected",
    "timestamp": "2026-04-12T..."
  }
  ```

### 📍 Route 2: Upload CSV
- **Method:** `POST`
- **URL:** `http://localhost:3000/api/v1/upload`
- **Headers:**
  - `x-user-id` -> `12345`  *(Mock user ID)*
- **Body:** Select **Form-Data**
  - Key: `file` (make sure you change the key type from "Text" to "File" hidden in the dropdown inside the key field)
  - Value: Select any test `.csv` file from your desktop.
- **Expected Output (202 Accepted):**
  ```json
  {
    "jobId": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "status": "pending",
    "message": "File accepted. Poll GET /api/v1/jobs/:jobId for status."
  }
  ```
> **Note:** Copy the `jobId` from this response for the next steps!

### 📍 Route 3: Check Job Status
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/jobs/{PASTE_YOUR_JOB_ID_HERE}`
- **Expected Output:**
  ```json
  {
    "jobId": "...",
    "userId": "12345",
    "status": "pending / processing / completed",
    "progress": 0 
  }
  ```

### 📍 Route 4: Fetch Completed Transactions
- **Method:** `GET`
- **URL:** `http://localhost:3000/api/v1/jobs/{PASTE_YOUR_JOB_ID_HERE}/transactions?page=1&limit=50`
- **Expected Output:**
  ```json
  {
    "transactions": [
      {
        "txnId": "...",
        "amount": -10,
        "category": "Food"
      }
    ],
    "pagination": { "page": 1, "limit": 50, "total": 1, "pages": 1 }
  }
  ```

---

## 🤝 3. Connecting with the ML Engineer (End-to-End)

Your Node.js app and the ML Python app communicate entirely over internal HTTP calls. Here is how your worker delegates the processing:

### Local Integration Walkthrough:
1. **Match the Secret Key:** Look in your `.env` for `ML_INTERNAL_SECRET`. You and the ML Developer must have the exact same secret string in your respective configurations.
2. **Start the ML Server:** The ML developer starts their FastAPI application (usually defaults to port `8000`). Make sure your `.env` points properly to `ML_SERVICE_URL=http://localhost:8000`.
3. **Turn Everything On:** 
   - `npm start` (API Server)
   - `npm run start:worker` (Queue Processor Engine)
4. **The Handshake:** Hit the Upload route in Postman (Route 2 above). The Express server saves the CSV and gives you the `jobId`. Simultaneously, your BullMQ worker slices that CSV, packages it as JSON, and `POST`s it to the Python server natively. 
   - You can watch this handover occur visually by visiting `http://localhost:3000/admin/queues` in your web browser.
