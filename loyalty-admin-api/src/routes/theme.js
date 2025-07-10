const express = require('express');
const router = express.Router();
const themeController = require('../controllers/themeController');
const authMiddleware = require('../middleware/auth');
const { validateTheme, validateId } = require('../middleware/simpleValidation');

// All routes require authentication
router.use(authMiddleware);

// Theme color routes
router.get('/colors', themeController.getColors);
router.put('/colors', validateTheme, themeController.updateColors);

// Theme preset routes
router.get('/presets', themeController.getPresets);
router.post('/presets', validateTheme, themeController.createPreset);
router.put('/presets/:id/apply', validateId, themeController.applyPreset);
router.delete('/presets/:id', validateId, themeController.deletePreset);

module.exports = router;