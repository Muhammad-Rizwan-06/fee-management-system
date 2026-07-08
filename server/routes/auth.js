const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, adminOnly, studentOnly } = require('../middleware/auth');
const {
  adminLogin,
  studentLogin,
  getMe,
  updateAdminProfile,
  updateStudentProfile,
  updateProfilePicture,
  configureSystem
} = require('../controllers/authController');

// Multer Storage Configuration for Profile Pictures
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads/profiles'));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|webp/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Images only (jpeg, jpg, png, webp)'));
    }
  }
});

router.post('/admin/login', adminLogin);
router.post('/student/login', studentLogin);
router.get('/me', protect, getMe);
router.put('/admin/profile', protect, adminOnly, updateAdminProfile);
router.put('/student/profile', protect, studentOnly, updateStudentProfile);
router.put('/profile-picture', protect, upload.single('picture'), updateProfilePicture);
router.post('/configure-system', protect, adminOnly, configureSystem);

module.exports = router;
