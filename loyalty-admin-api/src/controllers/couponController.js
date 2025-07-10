const Coupon = require('../models/Coupon');
const { Op } = require('sequelize');

// Get all coupons with pagination and filtering
const getCoupons = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { 
      page = 1, 
      limit = 20, 
      isActive, 
      discountType, 
      search,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { businessId };

    // Apply filters
    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    if (discountType) {
      where.discountType = discountType;
    }

    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { code: { [Op.iLike]: `%${search}%` } },
        { description: { [Op.iLike]: `%${search}%` } }
      ];
    }

    // Filter out expired coupons unless specifically requested
    if (req.query.includeExpired !== 'true') {
      where[Op.or] = [
        { expirationDate: null },
        { expirationDate: { [Op.gt]: new Date() } }
      ];
    }

    const { count, rows: coupons } = await Coupon.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [[sortBy, sortOrder.toUpperCase()]],
      attributes: {
        include: [
          // Add computed fields
          [
            'CASE WHEN expiration_date IS NOT NULL AND expiration_date <= NOW() THEN true ELSE false END',
            'isExpired'
          ],
          [
            'CASE WHEN usage_limit IS NOT NULL AND used_count >= usage_limit THEN true ELSE false END',
            'isUsageLimitReached'
          ]
        ]
      }
    });

    res.json({
      success: true,
      coupons,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(count / limit),
        totalItems: count,
        itemsPerPage: parseInt(limit)
      }
    });

  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve coupons'
    });
  }
};

// Get single coupon
const getCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    
    const coupon = await Coupon.findByPk(id);
    
    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon not found',
        message: 'The requested coupon does not exist'
      });
    }

    // Add computed fields
    const isExpired = coupon.expirationDate && coupon.expirationDate <= new Date();
    const isUsageLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;

    res.json({
      success: true,
      coupon: {
        ...coupon.toJSON(),
        isExpired,
        isUsageLimitReached
      }
    });

  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve coupon'
    });
  }
};

// Create new coupon
const createCoupon = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const {
      title,
      description,
      code,
      discountType,
      discountValue,
      minimumPurchase,
      expirationDate,
      usageLimit,
      targetRankingLevel
    } = req.body;

    // Check if code already exists for this business
    const existingCoupon = await Coupon.findOne({ 
      where: { 
        businessId,
        code: code.toUpperCase() 
      } 
    });
    
    if (existingCoupon) {
      return res.status(400).json({
        error: 'Coupon code already exists',
        message: 'A coupon with this code already exists'
      });
    }

    // Validate discount value based on type
    if (discountType === 'percentage' && discountValue > 100) {
      return res.status(400).json({
        error: 'Invalid discount value',
        message: 'Percentage discount cannot be greater than 100%'
      });
    }

    // Validate expiration date
    if (expirationDate && new Date(expirationDate) <= new Date()) {
      return res.status(400).json({
        error: 'Invalid expiration date',
        message: 'Expiration date must be in the future'
      });
    }

    const coupon = await Coupon.create({
      businessId,
      title,
      description,
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minimumPurchase: minimumPurchase || 0,
      expirationDate: expirationDate ? new Date(expirationDate) : null,
      usageLimit,
      targetRankingLevel
    });

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      coupon
    });

  } catch (error) {
    console.error('Create coupon error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Duplicate coupon code',
        message: 'A coupon with this code already exists'
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create coupon'
    });
  }
};

// Update coupon
const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      code,
      discountType,
      discountValue,
      minimumPurchase,
      expirationDate,
      usageLimit,
      isActive,
      targetRankingLevel
    } = req.body;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon not found',
        message: 'The requested coupon does not exist'
      });
    }

    // If code is being changed, check for duplicates
    if (code && code.toUpperCase() !== coupon.code) {
      const existingCoupon = await Coupon.findOne({ 
        where: { 
          code: code.toUpperCase(),
          id: { [Op.ne]: id }
        } 
      });
      
      if (existingCoupon) {
        return res.status(400).json({
          error: 'Coupon code already exists',
          message: 'A coupon with this code already exists'
        });
      }
    }

    // Validate discount value based on type
    const newDiscountType = discountType || coupon.discountType;
    const newDiscountValue = discountValue !== undefined ? discountValue : coupon.discountValue;
    
    if (newDiscountType === 'percentage' && newDiscountValue > 100) {
      return res.status(400).json({
        error: 'Invalid discount value',
        message: 'Percentage discount cannot be greater than 100%'
      });
    }

    // Validate expiration date
    if (expirationDate && new Date(expirationDate) <= new Date()) {
      return res.status(400).json({
        error: 'Invalid expiration date',
        message: 'Expiration date must be in the future'
      });
    }

    await coupon.update({
      title: title || coupon.title,
      description: description !== undefined ? description : coupon.description,
      code: code ? code.toUpperCase() : coupon.code,
      discountType: discountType || coupon.discountType,
      discountValue: discountValue !== undefined ? discountValue : coupon.discountValue,
      minimumPurchase: minimumPurchase !== undefined ? minimumPurchase : coupon.minimumPurchase,
      expirationDate: expirationDate !== undefined ? (expirationDate ? new Date(expirationDate) : null) : coupon.expirationDate,
      usageLimit: usageLimit !== undefined ? usageLimit : coupon.usageLimit,
      isActive: isActive !== undefined ? isActive : coupon.isActive,
      targetRankingLevel: targetRankingLevel !== undefined ? targetRankingLevel : coupon.targetRankingLevel
    });

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      coupon
    });

  } catch (error) {
    console.error('Update coupon error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update coupon'
    });
  }
};

// Delete coupon
const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon not found',
        message: 'The requested coupon does not exist'
      });
    }

    await coupon.destroy();

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });

  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete coupon'
    });
  }
};

// Toggle coupon active status
const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon not found',
        message: 'The requested coupon does not exist'
      });
    }

    await coupon.update({ isActive: !coupon.isActive });

    res.json({
      success: true,
      message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
      coupon
    });

  } catch (error) {
    console.error('Toggle coupon status error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to toggle coupon status'
    });
  }
};

// Get coupon analytics
const getCouponAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findByPk(id);
    if (!coupon) {
      return res.status(404).json({
        error: 'Coupon not found',
        message: 'The requested coupon does not exist'
      });
    }

    // Calculate analytics
    const isExpired = coupon.expirationDate && coupon.expirationDate <= new Date();
    const isUsageLimitReached = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
    const usagePercentage = coupon.usageLimit ? (coupon.usedCount / coupon.usageLimit) * 100 : 0;
    
    let daysUntilExpiration = null;
    if (coupon.expirationDate) {
      const today = new Date();
      const expDate = new Date(coupon.expirationDate);
      daysUntilExpiration = Math.ceil((expDate - today) / (1000 * 60 * 60 * 24));
    }

    const analytics = {
      totalUsage: coupon.usedCount,
      usageLimit: coupon.usageLimit,
      usagePercentage: Math.round(usagePercentage),
      remainingUses: coupon.usageLimit ? coupon.usageLimit - coupon.usedCount : null,
      isExpired,
      isUsageLimitReached,
      daysUntilExpiration,
      status: coupon.isActive ? 'active' : 'inactive',
      effectiveness: usagePercentage > 50 ? 'high' : usagePercentage > 20 ? 'medium' : 'low'
    };

    res.json({
      success: true,
      coupon,
      analytics
    });

  } catch (error) {
    console.error('Get coupon analytics error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve coupon analytics'
    });
  }
};

// Bulk operations
const bulkUpdateCoupons = async (req, res) => {
  try {
    const { couponIds, action, data } = req.body;

    if (!Array.isArray(couponIds) || couponIds.length === 0) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Coupon IDs must be a non-empty array'
      });
    }

    let updateData = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true };
        message = 'Coupons activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false };
        message = 'Coupons deactivated successfully';
        break;
      case 'delete':
        await Coupon.destroy({ where: { id: couponIds } });
        return res.json({
          success: true,
          message: 'Coupons deleted successfully'
        });
      case 'update':
        if (!data) {
          return res.status(400).json({
            error: 'Invalid data',
            message: 'Update data is required'
          });
        }
        updateData = data;
        message = 'Coupons updated successfully';
        break;
      default:
        return res.status(400).json({
          error: 'Invalid action',
          message: 'Action must be one of: activate, deactivate, delete, update'
        });
    }

    const [updatedCount] = await Coupon.update(updateData, {
      where: { id: couponIds }
    });

    res.json({
      success: true,
      message,
      updatedCount
    });

  } catch (error) {
    console.error('Bulk update coupons error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to perform bulk operation'
    });
  }
};

module.exports = {
  getCoupons,
  getCoupon,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  getCouponAnalytics,
  bulkUpdateCoupons
};