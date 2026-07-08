const Student = require('../models/Student');
const Challan = require('../models/Challan');
const DirectMessage = require('../models/DirectMessage');

// Student upload payment receipt
exports.uploadReceipt = async (req, res) => {
  try {
    const { amount } = req.body;
    const student = await Student.findById(req.user._id);

    if (!student) {
      return res.status(404).json({ success: false, error: 'Student profile not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Please upload a challan receipt image' });
    }

    const challanUrl = `/uploads/receipts/${req.file.filename}`;
    const period = student.currentPeriod;
    const groupIdentifier = student.session || student.classLevel;

    // Check if challan already exists for this period
    let challan = await Challan.findOne({ studentId: student._id, period });

    if (challan) {
      if (challan.feeStatus === 'paid') {
        return res.status(400).json({ success: false, error: 'Fees for this period have already been paid and verified' });
      }
      if (challan.feeStatus === 'pending') {
        return res.status(400).json({ success: false, error: 'A receipt for this period is already pending review' });
      }
      
      // If it was unpaid (rejected), update it
      challan.amount = amount;
      challan.challanUrl = challanUrl;
      challan.feeStatus = 'pending';
      challan.uploadedDate = Date.now();
      await challan.save();
    } else {
      // Create new challan record
      challan = await Challan.create({
        studentId: student._id,
        rollNo: student.rollNo,
        systemType: student.systemType,
        groupIdentifier,
        period,
        amount,
        challanUrl,
        feeStatus: 'pending'
      });
    }

    // Update Student feeStatus to pending
    student.feeStatus = 'pending';
    await student.save();

    res.status(200).json({ success: true, data: challan });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Student get payment history
exports.getStudentHistory = async (req, res) => {
  try {
    const history = await Challan.find({ studentId: req.user._id }).sort({ uploadedDate: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Student get individual direct messages/receipt updates
exports.getStudentMessages = async (req, res) => {
  try {
    const messages = await DirectMessage.find({ studentId: req.user._id }).sort({ date: -1 }).limit(10);
    res.status(200).json({ success: true, data: messages });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin view pending verification list (Admin only)
exports.getPendingChallans = async (req, res) => {
  try {
    // Populate student information
    const pending = await Challan.find({ feeStatus: 'pending' })
      .populate('studentId', 'name fatherName systemType session classLevel rollNo currentPeriod')
      .sort({ uploadedDate: -1 });

    res.status(200).json({ success: true, count: pending.length, data: pending });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin verify (approve or reject) payment receipt (Admin only)
exports.verifyChallan = async (req, res) => {
  try {
    const { challanId, action, reason } = req.body;

    if (!challanId || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ success: false, error: 'Provide valid challanId and action (approve/reject)' });
    }

    const challan = await Challan.findById(challanId);
    if (!challan) {
      return res.status(404).json({ success: false, error: 'Challan record not found' });
    }

    const student = await Student.findById(challan.studentId);
    if (!student) {
      return res.status(404).json({ success: false, error: 'Student associated with this challan not found' });
    }

    let subject = '';
    let messageText = '';

    if (action === 'approve') {
      challan.feeStatus = 'paid';
      student.feeStatus = 'paid';
      
      subject = 'Your Challan Has Been Accepted';
      messageText = `Dear ${student.name},<br><br>We are pleased to inform you that your fee challan for <strong>${challan.period}</strong> has been <strong>Accepted</strong>.<br>Your payment of Rs. ${challan.amount} has been successfully verified and processed.<br><br>Best regards,<br>Administration Department`;
    } else {
      challan.feeStatus = 'unpaid';
      student.feeStatus = 'unpaid';
      
      subject = 'Your Challan Has Been Rejected';
      messageText = `Dear ${student.name},<br><br>We regret to inform you that your fee challan for <strong>${challan.period}</strong> has been <strong>Rejected</strong>.<br>Reason: ${reason || 'Invalid receipt image. Please verify and resubmit.'}<br>Unfortunately, your payment verification could not be processed. Please review and resubmit.<br><br>Best regards,<br>Administration Department`;
    }

    await challan.save();
    await student.save();

    // Create DirectMessage log for student
    const dm = await DirectMessage.create({
      studentId: student._id,
      rollNo: student.rollNo,
      groupIdentifier: challan.groupIdentifier,
      subject,
      message: messageText
    });

    res.status(200).json({
      success: true,
      message: `Challan status updated to ${challan.feeStatus}`,
      data: challan,
      notification: dm
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Admin view collection summary stats (Admin only)
exports.getStats = async (req, res) => {
  try {
    const totalStudents = await Student.countDocuments();
    const paidCount = await Student.countDocuments({ feeStatus: 'paid' });
    const pendingCount = await Student.countDocuments({ feeStatus: 'pending' });
    const unpaidCount = await Student.countDocuments({ feeStatus: 'unpaid' });

    // Aggregate paid amounts from verified Challans
    const paidSummary = await Challan.aggregate([
      { $match: { feeStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalCollected = paidSummary.length > 0 ? paidSummary[0].total : 0;

    // Aggregate pending amounts
    const pendingSummary = await Challan.aggregate([
      { $match: { feeStatus: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const totalPendingAmount = pendingSummary.length > 0 ? pendingSummary[0].total : 0;

    res.status(200).json({
      success: true,
      stats: {
        totalStudents,
        paidCount,
        pendingCount,
        unpaidCount,
        totalCollected,
        totalPendingAmount
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
