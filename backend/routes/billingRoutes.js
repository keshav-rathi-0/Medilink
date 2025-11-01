const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect, authorize } = require('../middleware/auth');
const {
  createBill,
  getBills,
  getBill,
  recordPayment,
  processInsuranceClaim,
  updateInsuranceClaim
} = require('../controllers/billingController');

router.use(protect);

router.route('/')
  .get(authorize('Admin', 'Receptionist'), getBills)
  .post(authorize('Admin', 'Receptionist'), [
    body('patient').notEmpty().withMessage('Patient ID is required'),
    body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
    validate
  ], createBill);

router.route('/:id')
  .get(getBill);

router.post('/:id/payment', authorize('Admin', 'Receptionist'), recordPayment);
router.post('/:id/insurance', authorize('Admin', 'Receptionist'), processInsuranceClaim);
router.put('/:id/insurance', authorize('Admin'), updateInsuranceClaim);

module.exports = router;