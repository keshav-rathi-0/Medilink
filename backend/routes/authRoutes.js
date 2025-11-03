const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { validate } = require('../middleware/validator');
const { protect } = require('../middleware/auth');
const {
  register,
  login,
  forgotPassword,
  resetPassword,
  verifyToken,
  getMe,
  updatePassword
} = require('../controllers/authController');

// Registration with validation
router.post('/register', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone').notEmpty().withMessage('Phone is required'),
  body('dateOfBirth').optional().isISO8601().withMessage('Valid date of birth is required'),
  body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Gender must be Male, Female, or Other'),
  validate
], register);

// Login with validation
router.post('/login', [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
], login);

// Password reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:resettoken', resetPassword);

// Protected routes (require authentication)
router.get('/verify', protect, verifyToken); // ⭐ NEW - Used by AuthContext to verify token
router.get('/me', protect, getMe);
router.put('/update-password', protect, updatePassword);

module.exports = router;