const mongoose = require('mongoose');

const DirectMessageSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  rollNo: { type: String, required: true },
  groupIdentifier: { type: String, required: true }, // Session or Class
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('DirectMessage', DirectMessageSchema);
