const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  getAnnouncements,
  createAnnouncement,
  submitComment,
  getComments
} = require('../controllers/messageController');

// Public endpoints
router.get('/announcements', getAnnouncements);
router.post('/feedback', submitComment);

// Admin protected endpoints
router.post('/announcements', protect, adminOnly, createAnnouncement);
router.get('/feedback', protect, adminOnly, getComments);

module.exports = router;
