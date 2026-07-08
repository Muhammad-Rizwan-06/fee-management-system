const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const receiptsDir = path.join(__dirname, 'uploads/receipts');
const profilesDir = path.join(__dirname, 'uploads/profiles');

[uploadsDir, receiptsDir, profilesDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Static directories serving files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const authRoutes = require('./routes/auth');
const studentRoutes = require('./routes/students');
const challanRoutes = require('./routes/challans');
const messageRoutes = require('./routes/messages');
const groupRoutes = require('./routes/groups');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/challans', challanRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Simple Healthcheck API
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Fee Management System API is running smoothly' });
});

// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fee_management';

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB database');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB database connection error:', err);
  });
