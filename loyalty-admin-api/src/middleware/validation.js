const { body, param, query, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }
  next();
};

// Auth validation rules
const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

// Business validation rules
const validateBusinessInfo = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Business name is required and must be less than 255 characters'),
  body('contactEmail')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Valid email format required'),
  body('contactPhone')
    .optional()
    .isMobilePhone()
    .withMessage('Valid phone number required'),
  handleValidationErrors
];

// Theme validation rules
const validateTheme = [
  body('colors')
    .isObject()
    .withMessage('Colors must be an object'),
  body('colors.primary')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Primary color must be a valid hex color'),
  body('colors.secondary')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Secondary color must be a valid hex color'),
  body('colors.accent')
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Accent color must be a valid hex color'),
  handleValidationErrors
];

// Ranking validation rules
const validateRanking = [
  body('level')
    .isInt({ min: 1, max: 10 })
    .withMessage('Level must be an integer between 1 and 10'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Title is required and must be less than 100 characters'),
  body('pointsRequired')
    .isInt({ min: 0 })
    .withMessage('Points required must be a non-negative integer'),
  body('color')
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage('Color must be a valid hex color'),
  handleValidationErrors
];

// Coupon validation rules
const validateCoupon = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('code')
    .trim()
    .isLength({ min: 3, max: 50 })
    .isAlphanumeric()
    .withMessage('Code must be 3-50 alphanumeric characters'),
  body('discountType')
    .isIn(['percentage', 'fixed', 'points'])
    .withMessage('Discount type must be percentage, fixed, or points'),
  body('discountValue')
    .isFloat({ min: 0 })
    .withMessage('Discount value must be a positive number'),
  body('minimumPurchase')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum purchase must be a positive number'),
  body('expirationDate')
    .optional()
    .isISO8601()
    .toDate()
    .withMessage('Expiration date must be a valid date'),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  handleValidationErrors
];

// ID parameter validation
const validateId = [
  param('id')
    .isInt({ min: 1 })
    .withMessage('ID must be a positive integer'),
  handleValidationErrors
];

// Pagination validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
];

module.exports = {
  validateLogin,
  validateBusinessInfo,
  validateTheme,
  validateRanking,
  validateCoupon,
  validateId,
  validatePagination,
  handleValidationErrors
};