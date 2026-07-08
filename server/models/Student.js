const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  fatherName: { type: String, required: true },
  rollNo: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  dob: { type: String, required: true }, // Format: YYYY-MM-DD
  idCard: { type: String, required: true, unique: true }, // CNIC or Student ID
  gender: { type: String, enum: ['male', 'female', 'other'], required: true },
  picture: { type: String, default: 'studentplaceholder.jpg' },
  systemType: { type: String, enum: ['semester', 'annual'], required: true },
  session: { type: String }, // For University (e.g. 2023-2027)
  classLevel: { type: String }, // For School (e.g. Class 5)
  currentPeriod: { type: String, default: '1st Semester' }, // e.g. "1st Semester" or "January 2026"
  feeStatus: { type: String, enum: ['unpaid', 'pending', 'paid'], default: 'unpaid' },
  dueDate: { type: Date },
}, { timestamps: true });

// Indexing for unique roll numbers within the same Session (University) or Class (School)
StudentSchema.index({ rollNo: 1, session: 1 }, { unique: true, partialFilterExpression: { session: { $exists: true, $ne: null } } });
StudentSchema.index({ rollNo: 1, classLevel: 1 }, { unique: true, partialFilterExpression: { classLevel: { $exists: true, $ne: null } } });

module.exports = mongoose.model('Student', StudentSchema);
