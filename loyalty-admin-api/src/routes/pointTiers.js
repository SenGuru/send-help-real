const express = require('express');
const router = express.Router();
const pointTierController = require('../controllers/pointTierController');
const authMiddleware = require('../middleware/auth');
const { validateId } = require('../middleware/simpleValidation');

// All routes require authentication
router.use(authMiddleware);

// Point tier management routes
router.get('/', pointTierController.getPointTiers);
router.post('/', pointTierController.upsertPointTier);
router.delete('/:tierLevel', pointTierController.deletePointTier);

// Tier statistics
router.get('/stats', pointTierController.getTierStats);

// User tier management
router.post('/award-points', pointTierController.awardTierPoints);
router.get('/user/:userId', validateId, pointTierController.getUserTierProgress);

// Bulk operations
router.post('/recalculate', pointTierController.recalculateAllTiers);

module.exports = router;