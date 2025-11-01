const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createStaff,
  getStaff,
  getStaffMember,
  updateStaff,
  deleteStaff,
  updatePerformance
} = require('../controllers/staffController');

router.use(protect);
router.use(authorize('Admin'));

router.route('/')
  .get(getStaff)
  .post([
    body('userId').notEmpty().withMessage('User ID is required'),
    body('designation').notEmpty().withMessage('Designation is required'),
    body('department').notEmpty().withMessage('Department is required'),
    validate
  ], createStaff);

router.route('/:id')
  .get(getStaffMember)
  .put(updateStaff)
  .delete(deleteStaff);

router.put('/:id/performance', updatePerformance);

module.exports = router;
