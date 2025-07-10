const express = require('express');
const router = express.Router();
const { 
  awardPointsToUser, 
  bulkAwardPoints, 
  getAllPointsTransactions, 
  getPointsStatistics,
  adjustPoints 
} = require('../controllers/pointsController');
const authMiddleware = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Award points to a single user (admin only)
router.post('/award', awardPointsToUser);

// Bulk award/deduct points (admin only)
router.post('/bulk-award', bulkAwardPoints);

// Manual points adjustment (admin only)
router.post('/adjust', adjustPoints);

// Get all points transactions (admin only)
router.get('/transactions', getAllPointsTransactions);

// Get points statistics (admin only)
router.get('/stats', getPointsStatistics);

// Get user's points history (admin only)
router.get('/user/:userId/history', async (req, res) => {
  try {
    const { getPointsHistory } = require('../controllers/pointsController');
    // Set the user context for this request
    req.user = { userId: req.params.userId, businessId: req.admin.businessId };
    return getPointsHistory(req, res);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;