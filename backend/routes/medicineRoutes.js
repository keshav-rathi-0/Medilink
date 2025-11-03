const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  updateStock,
  getLowStockAlert,
  getExpiringMedicines,
  getExpiredMedicines,
  getMedicineCategories,
  getMedicineStats
} = require('../controllers/medicineController');

router.use(protect);

// Stats and alerts routes (must be before /:id)
router.get('/stats', authorize('Admin', 'Pharmacist', 'Doctor'), getMedicineStats);
router.get('/categories', getMedicineCategories);
router.get('/alerts/low-stock', authorize('Admin', 'Pharmacist'), getLowStockAlert);
router.get('/alerts/expiring', authorize('Admin', 'Pharmacist'), getExpiringMedicines);
router.get('/alerts/expired', authorize('Admin', 'Pharmacist'), getExpiredMedicines);

// Main medicine routes
router.route('/')
  .get(getMedicines)
  .post(authorize('Admin', 'Pharmacist'), [
    body('name').notEmpty().withMessage('Medicine name is required'),
    body('genericName').notEmpty().withMessage('Generic name is required'),
    body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
    body('category').notEmpty().withMessage('Category is required'),
    body('unitPrice').isFloat({ min: 0 }).withMessage('Valid unit price is required'),
    body('stockQuantity').isInt({ min: 0 }).withMessage('Valid stock quantity is required'),
    body('reorderLevel').isInt({ min: 0 }).withMessage('Valid reorder level is required'),
    body('expiryDate').isISO8601().withMessage('Valid expiry date is required'),
    validate
  ], createMedicine);

router.route('/:id')
  .get(getMedicine)
  .put(authorize('Admin', 'Pharmacist'), updateMedicine)
  .delete(authorize('Admin'), deleteMedicine);

// Stock management
router.put('/:id/stock', authorize('Admin', 'Pharmacist'), [
  body('quantity').isInt({ min: 1 }).withMessage('Valid quantity is required'),
  body('operation').isIn(['add', 'reduce', 'set']).withMessage('Valid operation is required'),
  validate
], updateStock);

module.exports = router;