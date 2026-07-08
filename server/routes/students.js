const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  addStudent,
  getStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  getFilterOptions,
  rollOverPeriod
} = require('../controllers/studentController');

router.use(protect); // All student routes require JWT login

router.route('/')
  .get(adminOnly, getStudents)
  .post(adminOnly, addStudent);

router.get('/filters', adminOnly, getFilterOptions);
router.post('/rollover', adminOnly, rollOverPeriod);

router.route('/:id')
  .get(getStudent)
  .put(adminOnly, updateStudent)
  .delete(adminOnly, deleteStudent);

module.exports = router;
