const mongoose = require('mongoose');

const AnnouncementSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Announcement', AnnouncementSchema);
