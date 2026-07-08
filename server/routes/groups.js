const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const {
  createGroup,
  getGroups,
  deleteGroup,
  rolloverGroup,
} = require('../controllers/groupController');

router.use(protect, adminOnly); // All group routes require admin JWT

router.route('/')
  .get(getGroups)
  .post(createGroup);

router.delete('/:id', deleteGroup);
router.post('/:id/rollover', rolloverGroup);

module.exports = router;
