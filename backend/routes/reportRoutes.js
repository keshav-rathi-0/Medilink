const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  getPatientVisitsReport,
  getDoctorPerformanceReport,
  getWardUsageReport,
  getRevenueReport,
  getDashboardStats
} = require('../controllers/reportController');

router.use(protect);
router.use(authorize('Admin'));

router.get('/patient-visits', getPatientVisitsReport);
router.get('/doctor-performance', getDoctorPerformanceReport);
router.get('/ward-usage', getWardUsageReport);
router.get('/revenue', getRevenueReport);
router.get('/dashboard', getDashboardStats);

module.exports = router;

