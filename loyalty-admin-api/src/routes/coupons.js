const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const authMiddleware = require('../middleware/auth');
const { validateCoupon, validateId, validatePagination } = require('../middleware/simpleValidation');

// All routes require authentication
router.use(authMiddleware);

// Coupons CRUD routes
router.get('/', validatePagination, couponController.getCoupons);
router.get('/:id', validateId, couponController.getCoupon);
router.post('/', validateCoupon, couponController.createCoupon);
router.put('/:id', validateId, validateCoupon, couponController.updateCoupon);
router.delete('/:id', validateId, couponController.deleteCoupon);

// Special operations
router.patch('/:id/toggle', validateId, couponController.toggleCouponStatus);
router.get('/:id/analytics', validateId, couponController.getCouponAnalytics);
router.put('/bulk', couponController.bulkUpdateCoupons);

module.exports = router;