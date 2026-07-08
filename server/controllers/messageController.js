const Announcement = require('../models/Announcement');
const Comment = require('../models/Comment');

// Get all announcements (Public / Students)
exports.getAnnouncements = async (req, res) => {
  try {
    const announcements = await Announcement.find().sort({ date: -1 }).limit(10);
    res.status(200).json({ success: true, data: announcements });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Create an announcement (Admin only)
exports.createAnnouncement = async (req, res) => {
  try {
    const { subject, message } = req.body;

    if (!subject || !message) {
      return res.status(400).json({ success: false, error: 'Provide subject and message' });
    }

    const announcement = await Announcement.create({ subject, message });
    res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Submit feedback/comment from Landing Page (Public)
exports.submitComment = async (req, res) => {
  try {
    const { name, email, comment } = req.body;

    if (!name || !email || !comment) {
      return res.status(400).json({ success: false, error: 'All fields are required' });
    }

    const newComment = await Comment.create({ name, email, comment });
    res.status(201).json({ success: true, data: newComment });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Display comments (Admin only)
exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: comments });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
