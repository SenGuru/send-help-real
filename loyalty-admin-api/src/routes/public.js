const express = require('express');
const router = express.Router();
const Business = require('../models/Business');
const Theme = require('../models/Theme');
const Ranking = require('../models/Ranking');
const Coupon = require('../models/Coupon');
const PointTier = require('../models/PointTier');

// Get business information by business code (for Flutter app)
router.get('/business/:businessCode', async (req, res) => {
  try {
    const { businessCode } = req.params;
    
    // Find business by business code
    const business = await Business.findOne({
      where: { businessCode: businessCode }
    });
    
    if (!business) {
      return res.status(404).json({
        error: 'Business not found',
        message: 'Invalid business code'
      });
    }

    // Get business theme
    const theme = await Theme.findOne({
      where: { businessId: business.id, isActive: true }
    });

    // Get business rankings
    const rankings = await Ranking.findAll({
      where: { businessId: business.id },
      order: [['level', 'ASC']]
    });

    // Get active coupons
    const coupons = await Coupon.findAll({
      where: { 
        businessId: business.id,
        isActive: true
      },
      order: [['created_at', 'DESC']]
    });

    // Get point tiers
    const pointTiers = await PointTier.findAll({
      where: {
        businessId: business.id,
        isActive: true
      },
      order: [['tierLevel', 'ASC']]
    });

    res.json({
      success: true,
      business: {
        id: business.id,
        name: business.name,
        description: business.description,
        logoUrl: business.logoUrl,
        contactEmail: business.contactEmail,
        contactPhone: business.contactPhone,
        address: business.address,
        operatingHours: business.operatingHours,
        category: business.category,
        website: business.website,
        established: business.established,
        memberSince: business.memberSince,
        totalMembers: business.totalMembers,
        features: business.features,
        socialMedia: business.socialMedia,
        loyaltyBenefits: business.loyaltyBenefits
      },
      theme: theme ? theme.colors : null,
      rankings,
      pointTiers: pointTiers.map(tier => ({
        id: tier.id,
        tierLevel: tier.tierLevel,
        name: tier.name,
        pointsRequired: tier.pointsRequired,
        description: tier.description,
        rewards: tier.rewards,
        color: tier.color,
        iconUrl: tier.iconUrl
      })),
      coupons: coupons.map(coupon => ({
        id: coupon.id,
        title: coupon.title,
        description: coupon.description,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        minimumPurchase: coupon.minimumPurchase,
        expirationDate: coupon.expirationDate,
        targetRankingLevel: coupon.targetRankingLevel
      }))
    });

  } catch (error) {
    console.error('Get business by code error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve business information'
    });
  }
});

// Health check for Flutter app
router.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Loyalty App API is running',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;