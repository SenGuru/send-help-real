const express = require('express');
const router = express.Router();
const superadminAuthController = require('../controllers/superadminAuthController');
const { authenticateSuperAdmin } = require('../middleware/superadminAuth');
const { validateLogin } = require('../middleware/simpleValidation');

// Public routes
router.post('/login', validateLogin, superadminAuthController.login);
router.post('/setup', superadminAuthController.createInitialSuperAdmin); // For initial setup only

// Protected routes
router.get('/verify', authenticateSuperAdmin, superadminAuthController.verify);
router.get('/profile', authenticateSuperAdmin, superadminAuthController.profile);
router.post('/logout', authenticateSuperAdmin, superadminAuthController.logout);

module.exports = router;