const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema(
  {
    jobId:       { type: String, required: true, index: true },
    userId:      { type: String, required: true, index: true },
    txnId:       { type: String, required: true }, // original CSV row id
    date:        { type: Date, required: true },
    description: { type: String, required: true },
    amount:      { type: Number, required: true }, // negative=debit, positive=credit
    currency:    { type: String, default: 'USD' },
    category:    { type: String, index: true },
    subcategory: { type: String },
    confidence:  { type: Number }, // 0.0 – 1.0
    tags:        [{ type: String }],
    // Pre-computed boolean for fast filtered queries (avoids range scan on confidence float)
    isLowConfidence: { type: Boolean, default: false },
    modelVersion: { type: String },
  },
  { timestamps: true }
);

// Fetch all transactions for a job (paginated, newest first)
TransactionSchema.index({ jobId: 1, date: -1 });
// Spending by category per user
TransactionSchema.index({ userId: 1, category: 1, date: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);
