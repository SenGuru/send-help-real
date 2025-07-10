const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');
const { validateLogin } = require('../middleware/simpleValidation');

// Public routes
router.post('/login', validateLogin, authController.login);
router.post('/setup', authController.createInitialAdmin); // For initial setup only

// Protected routes
router.get('/verify', authMiddleware, authController.verify);
router.post('/logout', authMiddleware, authController.logout);

module.exports = router;