const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Student = require('../models/Student');

// Helper to generate token
const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET || 'supersecretkeyforfeemanagementsystem', {
    expiresIn: '7d'
  });
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Please provide email and password' });
    }

    const admin = await User.findOne({ email });
    if (!admin) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials' });
    }

    const token = generateToken({ id: admin._id, role: 'admin' });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        picture: admin.picture,
        role: 'admin',
        systemType: admin.systemType,
        systemConfigured: admin.systemConfigured
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Student Login
exports.studentLogin = async (req, res) => {
  try {
    const { idCard, dob } = req.body;

    if (!idCard || !dob) {
      return res.status(400).json({ success: false, error: 'Please provide CNIC/ID Card and DOB' });
    }

    const student = await Student.findOne({ idCard });
    if (!student) {
      return res.status(401).json({ success: false, error: 'Student not found with this CNIC/ID Card' });
    }

    // Verify Date of Birth (Legacy format verification)
    if (student.dob !== dob) {
      return res.status(401).json({ success: false, error: 'Invalid birth date verification' });
    }

    const token = generateToken({
      id: student._id,
      rollNo: student.rollNo,
      role: 'student'
    });

    res.status(200).json({
      success: true,
      token,
      user: {
        id: student._id,
        name: student.name,
        fatherName: student.fatherName,
        rollNo: student.rollNo,
        email: student.email,
        dob: student.dob,
        idCard: student.idCard,
        gender: student.gender,
        picture: student.picture,
        systemType: student.systemType,
        session: student.session,
        classLevel: student.classLevel,
        currentPeriod: student.currentPeriod,
        feeStatus: student.feeStatus,
        dueDate: student.dueDate,
        role: 'student'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get current logged-in profile
exports.getMe = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      role: req.role,
      user: req.user
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Admin Profile Settings
exports.updateAdminProfile = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await User.findById(req.user._id);

    if (name) admin.name = name;
    if (email) admin.email = email;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      admin.password = await bcrypt.hash(password, salt);
    }

    await admin.save();
    res.status(200).json({
      success: true,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        picture: admin.picture,
        role: 'admin'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Student Profile Settings
exports.updateStudentProfile = async (req, res) => {
  try {
    const { name, fatherName, dob, idCard } = req.body;
    const student = await Student.findById(req.user._id);

    if (name) student.name = name;
    if (fatherName) student.fatherName = fatherName;
    if (dob) student.dob = dob;
    if (idCard) student.idCard = idCard;

    await student.save();
    res.status(200).json({
      success: true,
      user: student
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Profile Photo
exports.updateProfilePicture = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file uploaded' });
    }

    const picturePath = `/uploads/profiles/${req.file.filename}`;

    if (req.role === 'admin') {
      await User.findByIdAndUpdate(req.user._id, { picture: picturePath });
    } else {
      await Student.findByIdAndUpdate(req.user._id, { picture: picturePath });
    }

    res.status(200).json({
      success: true,
      picture: picturePath
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Configure System Type (one-time, locked after first set)
exports.configureSystem = async (req, res) => {
  try {
    const { systemType } = req.body;

    if (!systemType || !['semester', 'annual'].includes(systemType)) {
      return res.status(400).json({ success: false, error: 'Invalid system type. Must be "semester" or "annual".' });
    }

    const admin = await User.findById(req.user._id);
    if (!admin) {
      return res.status(404).json({ success: false, error: 'Admin account not found.' });
    }

    if (admin.systemConfigured) {
      return res.status(403).json({ success: false, error: 'System type is already configured and cannot be changed.' });
    }

    admin.systemType = systemType;
    admin.systemConfigured = true;
    await admin.save();

    res.status(200).json({
      success: true,
      user: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        picture: admin.picture,
        role: 'admin',
        systemType: admin.systemType,
        systemConfigured: admin.systemConfigured
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
