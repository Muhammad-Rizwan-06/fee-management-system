const Group = require('../models/Group');
const Student = require('../models/Student');

// Create a new Group (class or session)
exports.createGroup = async (req, res) => {
  try {
    const { name, currentPeriod, dueDate } = req.body;
    const systemType = req.user.systemType; // locked from admin's account

    if (!name) {
      return res.status(400).json({ success: false, error: 'Group name is required.' });
    }

    // Derive a sensible default period if not provided
    const period = currentPeriod || (systemType === 'semester' ? '1st Semester' : new Date().toLocaleString('default', { month: 'long', year: 'numeric' }));

    const group = await Group.create({
      name: name.trim(),
      systemType,
      adminId: req.user._id,
      currentPeriod: period,
      dueDate: dueDate ? new Date(dueDate) : null,
    });

    res.status(201).json({ success: true, data: group });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, error: 'A group with this name already exists.' });
    }
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get all Groups for this admin
exports.getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ adminId: req.user._id }).sort({ createdAt: -1 });

    // Attach student counts and fee status breakdown to each group
    const enriched = await Promise.all(
      groups.map(async (g) => {
        const filter = g.systemType === 'semester'
          ? { session: g.name }
          : { classLevel: g.name };

        const [total, paid, pending, unpaid] = await Promise.all([
          Student.countDocuments(filter),
          Student.countDocuments({ ...filter, feeStatus: 'paid' }),
          Student.countDocuments({ ...filter, feeStatus: 'pending' }),
          Student.countDocuments({ ...filter, feeStatus: 'unpaid' }),
        ]);

        return {
          ...g.toObject(),
          studentCount: total,
          paidCount: paid,
          pendingCount: pending,
          unpaidCount: unpaid,
        };
      })
    );

    res.status(200).json({ success: true, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Delete a Group (blocked if students exist in it)
exports.deleteGroup = async (req, res) => {
  try {
    const group = await Group.findOne({ _id: req.params.id, adminId: req.user._id });
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    const filter = group.systemType === 'semester'
      ? { session: group.name }
      : { classLevel: group.name };

    const studentCount = await Student.countDocuments(filter);
    if (studentCount > 0) {
      return res.status(400).json({
        success: false,
        error: `Cannot delete group — ${studentCount} student(s) are enrolled. Remove them first.`,
      });
    }

    await group.deleteOne();
    res.status(200).json({ success: true, message: 'Group deleted successfully.' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Rollover billing period for a specific Group
exports.rolloverGroup = async (req, res) => {
  try {
    const { currentPeriod, dueDate } = req.body;

    if (!currentPeriod || !dueDate) {
      return res.status(400).json({ success: false, error: 'New period label and due date are required.' });
    }

    const group = await Group.findOne({ _id: req.params.id, adminId: req.user._id });
    if (!group) {
      return res.status(404).json({ success: false, error: 'Group not found.' });
    }

    // Update group record
    group.currentPeriod = currentPeriod;
    group.dueDate = new Date(dueDate);
    await group.save();

    // Bulk-update all students in this group
    const filter = group.systemType === 'semester'
      ? { session: group.name }
      : { classLevel: group.name };

    const result = await Student.updateMany(filter, {
      $set: { currentPeriod, dueDate: new Date(dueDate), feeStatus: 'unpaid' },
    });

    res.status(200).json({
      success: true,
      message: `Rolled over ${result.modifiedCount} student(s) in "${group.name}" to "${currentPeriod}" (due ${dueDate}).`,
      data: group,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
