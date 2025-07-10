const express = require('express');
const router = express.Router();
const pointsController = require('../controllers/pointsController');
const { authenticateUser, requireAdmin } = require('../middleware/userAuth');
const { body, query, validationResult } = require('express-validator');

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

// All points routes require authentication
router.use(authenticateUser);

// Get user's points balance and ranking info
router.get('/balance', pointsController.getPointsBalance);

// Get points transaction history
router.get('/history', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('type')
    .optional()
    .isIn(['earned_purchase', 'earned_bonus', 'earned_manual', 'redeemed_coupon', 'redeemed_reward', 'redeemed_manual', 'expired', 'refunded'])
    .withMessage('Invalid transaction type'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid ISO 8601 date'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid ISO 8601 date'),
], validateRequest, pointsController.getPointsHistory);

// Get points expiring soon
router.get('/expiring', [
  query('days')
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage('Days must be between 1 and 365'),
], validateRequest, pointsController.getExpiringPoints);

// Get points earning summary by period
router.get('/summary', [
  query('period')
    .optional()
    .isIn(['daily', 'weekly', 'monthly', 'yearly'])
    .withMessage('Period must be one of: daily, weekly, monthly, yearly'),
], validateRequest, pointsController.getPointsEarningSummary);

// Get points leaderboard
router.get('/leaderboard', [
  query('period')
    .optional()
    .isIn(['all_time', 'this_month', 'this_year', 'last_30_days'])
    .withMessage('Period must be one of: all_time, this_month, this_year, last_30_days'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
], validateRequest, pointsController.getLeaderboard);

// Admin routes (require admin privileges)

// Manual points adjustment
router.post('/adjust', [
  requireAdmin,
  body('userId')
    .isInt({ min: 1 })
    .withMessage('Valid user ID is required'),
  body('points')
    .isInt({ min: -10000, max: 10000 })
    .custom(value => value !== 0)
    .withMessage('Points must be a non-zero integer between -10000 and 10000'),
  body('description')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('Description is required and must be less than 500 characters'),
  body('type')
    .optional()
    .isIn(['earned_manual', 'redeemed_manual'])
    .withMessage('Type must be either earned_manual or redeemed_manual'),
], validateRequest, pointsController.adjustPoints);

module.exports = router;