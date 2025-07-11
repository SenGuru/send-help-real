const express = require('express');
const router = express.Router();
const { getBusinessMembers, getUserDetails, updateUserStatus, updateUserDetails, removeUserFromBusiness } = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');
const { body, validationResult } = require('express-validator');

// Apply auth middleware to all routes
router.use(authMiddleware);

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

// Get all members of admin's business (admin only)
router.get('/', getBusinessMembers);

// Get specific user details (admin only)
router.get('/:userId', getUserDetails);

// Update user status (admin only)
router.put('/:userId/status', updateUserStatus);

// Update user details (admin only)
router.put('/:userId', updateUserDetails);

// Remove user from business (admin only)
router.delete('/:userId', removeUserFromBusiness);

module.exports = router;