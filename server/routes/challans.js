const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');
const {
  uploadReceipt,
  getStudentHistory,
  getStudentMessages,
  getPendingChallans,
  verifyChallan,
  getStats
} = require('../controllers/challanController');

// Multer Storage Configuration for Receipts
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/receipts'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_receipt_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp|pdf/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images and PDFs only!'));
    }
  }
});

router.use(protect); // All routes protected

// Student routes
router.post('/upload', studentOnly, upload.single('receipt'), uploadReceipt);
router.get('/history', studentOnly, getStudentHistory);
router.get('/messages', studentOnly, getStudentMessages);

// Admin routes
router.get('/pending', adminOnly, getPendingChallans);
router.post('/verify', adminOnly, verifyChallan);
router.get('/stats', adminOnly, getStats);

module.exports = router;
