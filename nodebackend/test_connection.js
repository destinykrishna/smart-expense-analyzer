const { classify } = require('./src/services/ml.service');
const dotenv = require('dotenv');

dotenv.config();

async function runTest() {
  console.log("Testing connection from Node backend to ML backend...");
  try {
    const transactions = [
      { id: "1", date: "2023-10-01", description: "McDonalds", amount: 15.50, currency: "USD" },
      { id: "2", date: "2023-10-02", description: "Uber Ride", amount: 25.00, currency: "USD" }
    ];
    
    const result = await classify("test-job-123", transactions);
    console.log("Success! Received response:");
    console.dir(result, { depth: null });
  } catch (error) {
    console.error("Failed to connect:");
    console.error(error);
  }
}

runTest();
