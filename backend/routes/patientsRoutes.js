const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createPatient,
  getPatients,
  getPatient,
  updatePatient,
  deletePatient,
  addMedicalHistory,
  addLabReport
} = require('../controllers/patientController');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Doctor', 'Nurse', 'Receptionist'), getPatients)
  .post(authorize('Admin', 'Receptionist'), [
    body('userId').notEmpty().withMessage('User ID is required'),
    validate
  ], createPatient);

router.route('/:id')
  .get(getPatient)
  .put(authorize('Admin', 'Doctor', 'Nurse', 'Receptionist'), updatePatient)
  .delete(authorize('Admin'), deletePatient);

router.post('/:id/medical-history', authorize('Doctor', 'Nurse'), addMedicalHistory);
router.post('/:id/lab-report', authorize('Doctor', 'Nurse'), addLabReport);

module.exports = router;