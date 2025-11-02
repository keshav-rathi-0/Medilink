const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createPatient,
  getPatients,
  getPatient,
  getAvailablePatientUsers,
  updatePatient,
  deletePatient,
  addMedicalHistory,
  updateMedicalHistory,
  deleteMedicalHistory,
  addLabReport,
  getPatientMedicalRecords,
  getPatientAppointments,
  getPatientStats
} = require('../controllers/patientController');

router.use(protect);

// Get available patient users (users with role "Patient" without profile)
router.get('/available-users', authorize('Admin', 'Receptionist'), getAvailablePatientUsers);

// Main patient routes
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

// Medical records
router.get('/:id/medical-records', getPatientMedicalRecords);

// Appointments
router.get('/:id/appointments', getPatientAppointments);

// Stats
router.get('/:id/stats', getPatientStats);

// Medical history routes
router.post('/:id/medical-history', authorize('Doctor', 'Nurse'), addMedicalHistory);
router.put('/:id/medical-history/:historyId', authorize('Doctor', 'Nurse'), updateMedicalHistory);
router.delete('/:id/medical-history/:historyId', authorize('Doctor', 'Nurse'), deleteMedicalHistory);

// Lab reports
router.post('/:id/lab-report', authorize('Doctor', 'Nurse'), addLabReport);

module.exports = router;