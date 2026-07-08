const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  picture: { type: String, default: 'adminplaceholder.jpg' },
  role: { type: String, default: 'admin' },
  systemType: { type: String, enum: ['semester', 'annual'], default: null },
  systemConfigured: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
