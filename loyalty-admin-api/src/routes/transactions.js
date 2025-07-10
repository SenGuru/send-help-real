const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const { authenticateUser, requireAdmin } = require('../middleware/userAuth');
const { body, query, param, validationResult } = require('express-validator');

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

// All transaction routes require authentication
router.use(authenticateUser);

// Create new transaction (record purchase and award points)
router.post('/', [
  body('totalAmount')
    .isFloat({ min: 0 })
    .withMessage('Total amount must be a positive number'),
  body('subtotal')
    .isFloat({ min: 0 })
    .withMessage('Subtotal must be a positive number'),
  body('tax')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Tax must be a non-negative number'),
  body('discount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Discount must be a non-negative number'),
  body('paymentMethod')
    .optional()
    .isIn(['cash', 'credit_card', 'debit_card', 'digital_wallet', 'gift_card', 'other'])
    .withMessage('Invalid payment method'),
  body('storeName')
    .optional()
    .trim()
    .isLength({ max: 255 })
    .withMessage('Store name must be less than 255 characters'),
  body('storeLocation')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Store location must be less than 500 characters'),
  body('cashierId')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Cashier ID must be less than 100 characters'),
  body('receiptNumber')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Receipt number must be less than 100 characters'),
  body('items')
    .optional()
    .isArray()
    .withMessage('Items must be an array'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object'),
], validateRequest, transactionController.createTransaction);

// Get user's transaction history
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['pending', 'completed', 'failed', 'refunded', 'cancelled'])
    .withMessage('Invalid status'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
], validateRequest, transactionController.getTransactionHistory);

// Get transaction details
router.get('/:transactionId', [
  param('transactionId')
    .isInt({ min: 1 })
    .withMessage('Transaction ID must be a positive integer'),
], validateRequest, transactionController.getTransactionDetails);

// Get transaction statistics
router.get('/stats/summary', [
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Period must be one of: daily, weekly, monthly, yearly'),
  query('userId')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User ID must be a positive integer'),
], validateRequest, transactionController.getTransactionStats);

// Admin routes

// Process refund
router.post('/:transactionId/refund', [
  requireAdmin,
  param('transactionId')
    .isInt({ min: 1 })
    .withMessage('Transaction ID must be a positive integer'),
  body('reason')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Refund reason must be less than 1000 characters'),
  body('refundAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Refund amount must be a positive number'),
], validateRequest, transactionController.processRefund);

module.exports = router;