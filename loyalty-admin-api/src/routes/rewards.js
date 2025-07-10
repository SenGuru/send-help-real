const express = require('express');
const router = express.Router();
const rewardController = require('../controllers/rewardController');
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

// All reward routes require authentication
router.use(authenticateUser);

// Get available rewards for user
router.get('/', [
  query('category')
    .optional()
    .isIn(['free_item', 'discount_percentage', 'discount_amount', 'free_shipping', 'upgrade', 'experience', 'other'])
    .withMessage('Invalid category'),
  query('minPoints')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum points must be a positive integer'),
  query('maxPoints')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Maximum points must be a positive integer'),
  query('featured')
    .optional()
    .isBoolean()
    .withMessage('Featured must be a boolean'),
], validateRequest, rewardController.getAvailableRewards);

// Get reward details
router.get('/:rewardId', [
  param('rewardId')
    .isInt({ min: 1 })
    .withMessage('Reward ID must be a positive integer'),
], validateRequest, rewardController.getRewardDetails);

// Redeem a reward
router.post('/:rewardId/redeem', [
  param('rewardId')
    .isInt({ min: 1 })
    .withMessage('Reward ID must be a positive integer'),
], validateRequest, rewardController.redeemReward);

// Get user's redemption history
router.get('/redemptions/history', [
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
    .isIn(['free_item', 'discount_percentage', 'discount_amount', 'free_shipping', 'upgrade', 'experience', 'other'])
    .withMessage('Invalid reward type'),
], validateRequest, rewardController.getRedemptionHistory);

// Admin routes (require admin privileges)

// Create new reward
router.post('/admin/create', [
  requireAdmin,
  body('title')
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title is required and must be less than 255 characters'),
  body('description')
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description is required'),
  body('pointsCost')
    .isInt({ min: 1 })
    .withMessage('Points cost must be a positive integer'),
  body('type')
    .optional()
    .isIn(['free_item', 'discount_percentage', 'discount_amount', 'free_shipping', 'upgrade', 'experience', 'other'])
    .withMessage('Invalid reward type'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a non-negative number'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('termsAndConditions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Terms and conditions must be less than 2000 characters'),
  body('validFrom')
    .optional()
    .isISO8601()
    .withMessage('Valid from date must be a valid ISO 8601 date'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until date must be a valid ISO 8601 date'),
  body('maxRedemptions')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max redemptions must be a positive integer'),
  body('maxRedemptionsPerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max redemptions per user must be a positive integer'),
  body('minimumRankingLevel')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum ranking level must be a positive integer'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt()
    .withMessage('Sort order must be an integer'),
], validateRequest, rewardController.createReward);

// Update reward
router.put('/admin/:rewardId', [
  requireAdmin,
  param('rewardId')
    .isInt({ min: 1 })
    .withMessage('Reward ID must be a positive integer'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 1, max: 255 })
    .withMessage('Title must be less than 255 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Description cannot be empty'),
  body('pointsCost')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Points cost must be a positive integer'),
  body('type')
    .optional()
    .isIn(['free_item', 'discount_percentage', 'discount_amount', 'free_shipping', 'upgrade', 'experience', 'other'])
    .withMessage('Invalid reward type'),
  body('value')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Value must be a non-negative number'),
  body('imageUrl')
    .optional()
    .isURL()
    .withMessage('Image URL must be a valid URL'),
  body('termsAndConditions')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Terms and conditions must be less than 2000 characters'),
  body('validFrom')
    .optional()
    .isISO8601()
    .withMessage('Valid from date must be a valid ISO 8601 date'),
  body('validUntil')
    .optional()
    .isISO8601()
    .withMessage('Valid until date must be a valid ISO 8601 date'),
  body('maxRedemptions')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max redemptions must be a positive integer'),
  body('maxRedemptionsPerUser')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Max redemptions per user must be a positive integer'),
  body('minimumRankingLevel')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Minimum ranking level must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Is active must be a boolean'),
  body('isFeatured')
    .optional()
    .isBoolean()
    .withMessage('Is featured must be a boolean'),
  body('sortOrder')
    .optional()
    .isInt()
    .withMessage('Sort order must be an integer'),
], validateRequest, rewardController.updateReward);

// Delete reward
router.delete('/admin/:rewardId', [
  requireAdmin,
  param('rewardId')
    .isInt({ min: 1 })
    .withMessage('Reward ID must be a positive integer'),
], validateRequest, rewardController.deleteReward);

module.exports = router;