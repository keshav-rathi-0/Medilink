const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getAdminDashboard,
  getDoctorDashboard,
  getPatientDashboard,
  getNurseDashboard,
  getReceptionistDashboard,
  getPharmacistDashboard
} = require('../controllers/dashboardController');
const { getUserPermissions } = require('../middleware/roleAccess');

// @desc    Get user permissions
// @route   GET /api/dashboards/permissions
// @access  Private
router.get('/permissions', protect, getUserPermissions);

// @desc    Get Admin Dashboard
// @route   GET /api/dashboards/admin
// @access  Private (Admin only)
router.get('/admin', protect, authorize('Admin'), getAdminDashboard);

// @desc    Get Doctor Dashboard
// @route   GET /api/dashboards/doctor
// @access  Private (Doctor only)
router.get('/doctor', protect, authorize('Doctor'), getDoctorDashboard);

// @desc    Get Patient Dashboard
// @route   GET /api/dashboards/patient
// @access  Private (Patient only)
router.get('/patient', protect, authorize('Patient'), getPatientDashboard);

// @desc    Get Nurse Dashboard
// @route   GET /api/dashboards/nurse
// @access  Private (Nurse only)
router.get('/nurse', protect, authorize('Nurse'), getNurseDashboard);

// @desc    Get Receptionist Dashboard
// @route   GET /api/dashboards/receptionist
// @access  Private (Receptionist only)
router.get('/receptionist', protect, authorize('Receptionist'), getReceptionistDashboard);

// @desc    Get Pharmacist Dashboard
// @route   GET /api/dashboards/pharmacist
// @access  Private (Pharmacist only)
router.get('/pharmacist', protect, authorize('Pharmacist'), getPharmacistDashboard);

module.exports = router;

