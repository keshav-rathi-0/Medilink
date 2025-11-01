const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createAppointment,
  getAppointments,
  getAppointment,
  updateAppointment,
  cancelAppointment,
  rescheduleAppointment
} = require('../controllers/appointmentController');

router.use(protect);

router.route('/')
  .get(getAppointments)
  .post([
    body('patient').notEmpty().withMessage('Patient ID is required'),
    body('doctor').notEmpty().withMessage('Doctor ID is required'),
    body('appointmentDate').isISO8601().withMessage('Valid date is required'),
    validate
  ], createAppointment);

router.route('/:id')
  .get(getAppointment)
  .put(authorize('Admin', 'Doctor', 'Receptionist'), updateAppointment);

router.put('/:id/cancel', cancelAppointment);
router.put('/:id/reschedule', rescheduleAppointment);

module.exports = router;
