const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createDoctor,
  getDoctors,
  getDoctor,
  updateDoctor,
  deleteDoctor,
  updateAvailability,
  addOnCallShift
} = require('../controllers/doctorController');

router.use(protect);

router.route('/')
  .get(getDoctors)
  .post(authorize('Admin'), [
    body('userId').notEmpty().withMessage('User ID is required'),
    body('specialization').notEmpty().withMessage('Specialization is required'),
    body('licenseNumber').notEmpty().withMessage('License number is required'),
    validate
  ], createDoctor);

router.route('/:id')
  .get(getDoctor)
  .put(authorize('Admin', 'Doctor'), updateDoctor)
  .delete(authorize('Admin'), deleteDoctor);

router.put('/:id/availability', authorize('Admin', 'Doctor'), updateAvailability);
router.post('/:id/oncall', authorize('Admin'), addOnCallShift);

module.exports = router;
