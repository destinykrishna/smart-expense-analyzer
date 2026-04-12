const mongoose = require('mongoose');

const JobSchema = new mongoose.Schema(
  {
    jobId:        { type: String, required: true, unique: true, index: true },
    userId:       { type: String, required: true, index: true },
    status:       {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    filePath:     { type: String, required: true },
    originalName: { type: String },
    rowCount:     { type: Number },
    progress:     { type: Number, default: 0 }, // 0–100
    modelVersion: { type: String },
    summary: {
      total:         Number,
      categorized:   Number,
      lowConfidence: Number,
    },
    error:    { type: String }, // last error message
    attempts: { type: Number, default: 0 },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Compound index for user dashboard queries (most recent jobs first)
JobSchema.index({ userId: 1, createdAt: -1 });
// For retry/monitoring queries
JobSchema.index({ status: 1, createdAt: 1 });

module.exports = mongoose.model('Job', JobSchema);
