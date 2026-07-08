const mongoose = require('mongoose');

const ChallanSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rollNo: { type: String, required: true },
  systemType: { type: String, enum: ['semester', 'annual'], required: true },
  groupIdentifier: { type: String, required: true }, // Stores Session or ClassLevel
  period: { type: String, required: true }, // Stores Semester or Month
  amount: { type: Number, required: true },
  challanUrl: { type: String, default: '' },
  feeStatus: { type: String, enum: ['unpaid', 'pending', 'paid'], default: 'unpaid' },
  uploadedDate: { type: Date, default: Date.now }
}, { timestamps: true });

// Avoid duplicate submissions by the same student for the same period
ChallanSchema.index({ studentId: 1, period: 1 }, { unique: true });

module.exports = mongoose.model('Challan', ChallanSchema);
