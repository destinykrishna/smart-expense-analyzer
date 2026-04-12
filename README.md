# Smart Expense Analyzer 🚀

A highly-scalable, microservice-based transaction categorization platform. This repository contains the **Node.js Integration Backend**, designed to asynchronously process massive `.csv` bank statement uploads, manage queues, and securely interface with an isolated Python Machine Learning server.

---

## 🛠️ Tech Stack
- **Engine:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Queue & Workers:** BullMQ + IORedis
- **Logging & Quality:** Winston, Joi (Validation), Jest (Testing)

---

## 🧠 System Architecture Overview
To achieve maximum fault tolerance, the application is divided into sub-systems:
1. **User Uploads (Express):** Express API handles file intake using `multer`, synchronous header validation, and rate-limiting. Files are staged out of memory.
2. **Asynchronous Hand-off (BullMQ):** Upon successful receipt, express immediately returns a `202 Accepted` response. The job is placed on a Redis-backed queue.
3. **Worker Processing:** A decoupled worker script picks up the job. It parses the `.csv` iteratively, frames the context, and transmits a payload to our Python machine learning cluster over HTTP.
4. **Data Persistence:** Wait loops, timeouts, and `NON_RETRYABLE` error flags are calculated dynamically. Successful categorization results are batched and persisted to MongoDB.

---

## 💻 Local Developer Setup

### 1. Prerequisites
Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v18+)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally)
- [Redis](https://redis.io/download) (Running locally)

### 2. Installation
Clone the repository and install the NPM packages:
```bash
git clone https://github.com/YourUsername/your-repo-name.git
cd your-repo-name
npm install
```

### 3. Environment Variables
Copy the example environment variables file and update your keys (Specifically ensuring your `ML_INTERNAL_SECRET` matches the downstream ML service):
```bash
cp .env.example .env
```

---

## 🏃 Running the Application

Because this is an asynchronous system, the Web Server and the Queue Worker run as completely separate instances. You must have both running to process files end-to-end.

**Start the API Web Server:**
```bash
npm start
```
*API runs by default on `http://localhost:3000`*

**Start the Background Worker:**
(Open a second terminal instance)
```bash
npm run start:worker
```

---

## 📊 Queue Visualization Dashboard
This system utilizes `@bull-board` to visually represent background pipeline health, failures, and active processing memory. 
While your engines are running, view the dashboard natively at:
👉 **[http://localhost:3000/admin/queues](http://localhost:3000/admin/queues)**

---

## 🧪 Testing
The architecture has an integrated unit and mock-testing framework designed not to pollute local MongoDB and Redis bindings. 
To ping routes and stress-test the environment safely:
```bash
npm test
```

---
*Built with ❤️ utilizing Event-Driven Architectural Principles.*
