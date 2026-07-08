const Student = require('../models/Student');
const Group = require('../models/Group');

// Add Student (Admin only)
exports.addStudent = async (req, res) => {
  try {
    const { name, fatherName, rollNo, email, dob, idCard, gender, systemType, session, classLevel } = req.body;

    // Check duplicate email
    const duplicateEmail = await Student.findOne({ email });
    if (duplicateEmail) {
      return res.status(400).json({ success: false, error: 'Email already exists!' });
    }

    // Check duplicate ID card (CNIC)
    const duplicateId = await Student.findOne({ idCard });
    if (duplicateId) {
      return res.status(400).json({ success: false, error: 'CNIC/ID Card number already exists!' });
    }

    // Check duplicate roll number in session/class
    if (systemType === 'semester') {
      if (!session) {
        return res.status(400).json({ success: false, error: 'Session is required for University semester system' });
      }
      const duplicateRoll = await Student.findOne({ rollNo, session });
      if (duplicateRoll) {
        return res.status(400).json({ success: false, error: 'Roll number already exists in this session!' });
      }
    } else {
      if (!classLevel) {
        return res.status(400).json({ success: false, error: 'Class is required for School annual system' });
      }
      const duplicateRoll = await Student.findOne({ rollNo, classLevel });
      if (duplicateRoll) {
        return res.status(400).json({ success: false, error: 'Roll number already exists in this class!' });
      }
    }

    // Inherit currentPeriod and dueDate from the group if it exists
    const groupName = systemType === 'semester' ? session : classLevel;
    const group = await Group.findOne({ name: groupName, systemType, adminId: req.user._id });
    const inheritedPeriod = group?.currentPeriod || (systemType === 'semester' ? '1st Semester' : new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));
    const inheritedDueDate = group?.dueDate || null;

    const student = await Student.create({
      name,
      fatherName,
      rollNo,
      email,
      dob,
      idCard,
      gender,
      systemType,
      session: systemType === 'semester' ? session : undefined,
      classLevel: systemType === 'annual' ? classLevel : undefined,
      currentPeriod: inheritedPeriod,
      feeStatus: 'unpaid',
      dueDate: inheritedDueDate
    });

    res.status(201).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all students with search & filters (Admin only)
exports.getStudents = async (req, res) => {
  try {
    const { search, systemType, session, classLevel, feeStatus } = req.query;
    
    let query = {};

    if (systemType) {
      query.systemType = systemType;
    }
    if (session) {
      query.session = session;
    }
    if (classLevel) {
      query.classLevel = classLevel;
    }
    if (feeStatus) {
      query.feeStatus = feeStatus;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { fatherName: { $regex: search, $options: 'i' } },
        { rollNo: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { idCard: { $regex: search, $options: 'i' } }
      ];
    }

    const students = await Student.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: students.length, data: students });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get single student
exports.getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update Student (Admin only)
exports.updateStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }

    res.status(200).json({ success: true, data: student });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete Student (Admin only)
exports.deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student not found' });
    }
    res.status(200).json({ success: true, data: 'Student deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get unique list of sessions and classes (Admin only)
exports.getFilterOptions = async (req, res) => {
  try {
    const sessions = await Student.distinct('session', { session: { $exists: true, $ne: null } });
    const classes = await Student.distinct('classLevel', { classLevel: { $exists: true, $ne: null } });

    res.status(200).json({
      success: true,
      sessions: sessions.sort(),
      classes: classes.sort()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Bulk Update Billing Period (Admin only - sets new due date & reset fee status to unpaid)
exports.rollOverPeriod = async (req, res) => {
  try {
    const { systemType, groupIdentifier, currentPeriod, dueDate } = req.body;

    if (!systemType || !groupIdentifier || !currentPeriod || !dueDate) {
      return res.status(400).json({ success: false, error: 'Provide systemType, groupIdentifier, currentPeriod and dueDate' });
    }

    let filter = { systemType };
    if (systemType === 'semester') {
      filter.session = groupIdentifier;
    } else {
      filter.classLevel = groupIdentifier;
    }

    const result = await Student.updateMany(filter, {
      $set: {
        currentPeriod,
        dueDate: new Date(dueDate),
        feeStatus: 'unpaid'
      }
    });

    res.status(200).json({
      success: true,
      message: `Successfully rolled over ${result.modifiedCount} students in ${groupIdentifier} to ${currentPeriod} due by ${dueDate}`,
      modifiedCount: result.modifiedCount
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
