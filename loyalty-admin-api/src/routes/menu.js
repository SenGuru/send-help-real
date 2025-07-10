const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');
const authMiddleware = require('../middleware/auth');
const { validateId } = require('../middleware/simpleValidation');

// All routes require authentication
router.use(authMiddleware);

// Menu item management routes
router.get('/items', menuController.getMenuItems);
router.get('/categories', menuController.getMenuCategories);
router.post('/items', menuController.createMenuItem);
router.put('/items/:id', validateId, menuController.updateMenuItem);
router.delete('/items/:id', validateId, menuController.deleteMenuItem);

// Purchase management routes
router.post('/purchase', menuController.recordPurchase);
router.get('/purchases', menuController.getPurchaseHistory);

// Statistics
router.get('/stats', menuController.getMenuStats);

module.exports = router;