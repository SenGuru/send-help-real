const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateUser, requireAdmin } = require('../middleware/userAuth');
const { body, validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Public routes (no authentication required)

// User registration (business-independent)
router.post('/register', [
  body('firstName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name is required and must be less than 100 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name is required and must be less than 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long'),
  body('phoneNumber')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10-15 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),
], validateRequest, userController.register);

// Join business with business code
router.post('/join-business', [
  authenticateUser,
  body('businessCode')
    .isLength({ min: 5, max: 5 })
    .withMessage('Business code must be exactly 5 characters')
    .isUppercase()
    .withMessage('Business code must be uppercase'),
], validateRequest, userController.joinBusiness);

// User login (business-independent)
router.post('/login', [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
], validateRequest, userController.login);

// Protected routes (authentication required)

// Get user profile
router.get('/profile', authenticateUser, userController.getProfile);

// Get user business memberships
router.get('/business-memberships', authenticateUser, userController.getBusinessMemberships);

// Update user profile
router.put('/profile', [
  authenticateUser,
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('First name must be less than 100 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Last name must be less than 100 characters'),
  body('phoneNumber')
    .optional()
    .isLength({ min: 10, max: 15 })
    .withMessage('Phone number must be between 10-15 characters'),
  body('dateOfBirth')
    .optional()
    .isISO8601()
    .withMessage('Valid date of birth is required'),
  body('preferences')
    .optional()
    .isObject()
    .withMessage('Preferences must be an object'),
], validateRequest, userController.updateProfile);

// Get user statistics
router.get('/stats', authenticateUser, userController.getUserStats);

module.exports = router;