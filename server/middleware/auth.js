const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Student = require('../models/Student');

exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, error: 'Not authorized to access this route' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecretkeyforfeemanagementsystem');
    
    if (decoded.role === 'admin') {
      req.user = await User.findById(decoded.id).select('-password');
      req.role = 'admin';
    } else if (decoded.role === 'student') {
      req.user = await Student.findById(decoded.id);
      req.role = 'student';
    }

    if (!req.user) {
      return res.status(401).json({ success: false, error: 'User associated with token no longer exists' });
    }

    next();
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Token invalid or expired' });
  }
};

exports.adminOnly = (req, res, next) => {
  if (req.role !== 'admin') {
    return res.status(403).json({ success: false, error: 'Access forbidden: Administrators only' });
  }
  next();
};

exports.studentOnly = (req, res, next) => {
  if (req.role !== 'student') {
    return res.status(403).json({ success: false, error: 'Access forbidden: Students only' });
  }
  next();
};
