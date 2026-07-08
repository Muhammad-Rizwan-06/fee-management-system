const mongoose = require('mongoose');

const GroupSchema = new mongoose.Schema({
  name: { type: String, required: true },          // e.g. "2023-2027" or "Class 10"
  systemType: { type: String, enum: ['semester', 'annual'], required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  currentPeriod: { type: String, default: '' },    // e.g. "1st Semester" or "January 2026"
  dueDate: { type: Date, default: null },
}, { timestamps: true });

// A given admin cannot have two groups with the same name and system type
GroupSchema.index({ adminId: 1, name: 1, systemType: 1 }, { unique: true });

module.exports = mongoose.model('Group', GroupSchema);
