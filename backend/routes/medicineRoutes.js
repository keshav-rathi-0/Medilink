const express = require('express');
const { body } = require('express-validator');
const {
  createMedicine,
  getMedicines,
  getMedicine,
  updateMedicine,
  deleteMedicine,
  updateStock,
  getLowStockAlert,
  getExpiringMedicines,
} = require('../controllers/medicineController');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// ✅ All routes below require authentication
router.use(protect);

// 📦 Get all medicines / Create a new medicine
router
  .route('/')
  .get(getMedicines)
  .post(
    authorize('Admin', 'Pharmacist'),
    [
      body('name').notEmpty().withMessage('Medicine name is required'),
      body('manufacturer').notEmpty().withMessage('Manufacturer is required'),
      body('unitPrice').isNumeric().withMessage('Unit price must be numeric'),
      validate,
    ],
    createMedicine
  );

// ⚠️ Alerts for low stock and expiring medicines
router.get('/low-stock', authorize('Admin', 'Pharmacist'), getLowStockAlert);
router.get('/expiring', authorize('Admin', 'Pharmacist'), getExpiringMedicines);

// 🧾 Get / Update / Delete a specific medicine
router
  .route('/:id')
  .get(getMedicine)
  .put(authorize('Admin', 'Pharmacist'), updateMedicine)
  .delete(authorize('Admin'), deleteMedicine);

// 🔄 Update stock for a specific medicine
router.put('/:id/stock', authorize('Admin', 'Pharmacist'), updateStock);

module.exports = router;