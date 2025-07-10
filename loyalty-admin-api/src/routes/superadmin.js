const express = require('express');
const router = express.Router();
const db = require('../config/database');
const { authenticateSuperAdmin } = require('../middleware/superadminAuth');
const Business = require('../models/Business');

// Get all users across all businesses (superadmin only)
router.get('/users', authenticateSuperAdmin, async (req, res) => {
  try {
    const users = await db.all(`
      SELECT 
        u.*,
        b.name as business_name,
        b.code as business_code,
        ub.created_at as joined_business_at
      FROM users u
      LEFT JOIN user_businesses ub ON u.id = ub.user_id
      LEFT JOIN businesses b ON ub.business_id = b.id
      ORDER BY u.created_at DESC
    `);

    res.json({
      success: true,
      data: {
        users: users,
        total: users.length
      }
    });
  } catch (error) {
    console.error('Error fetching all users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// Get all businesses (superadmin only)
router.get('/businesses', authenticateSuperAdmin, async (req, res) => {
  try {
    const businesses = await db.all(`
      SELECT 
        b.*,
        COUNT(ub.user_id) as user_count
      FROM businesses b
      LEFT JOIN user_businesses ub ON b.id = ub.business_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `);

    res.json({
      success: true,
      data: {
        businesses: businesses,
        total: businesses.length
      }
    });
  } catch (error) {
    console.error('Error fetching businesses:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch businesses'
    });
  }
});

// Get system stats (superadmin only)
router.get('/stats', authenticateSuperAdmin, async (req, res) => {
  try {
    const totalUsers = await db.get('SELECT COUNT(*) as count FROM users');
    const totalBusinesses = await db.get('SELECT COUNT(*) as count FROM businesses');
    const totalTransactions = await db.get('SELECT COUNT(*) as count FROM transactions');
    const totalPoints = await db.get('SELECT SUM(amount) as total FROM points_transactions WHERE type = "earned"');

    res.json({
      success: true,
      data: {
        totalUsers: totalUsers.count,
        totalBusinesses: totalBusinesses.count,
        totalTransactions: totalTransactions.count,
        totalPoints: totalPoints.total || 0
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch stats'
    });
  }
});

// Create a new business (superadmin only)
router.post('/businesses', authenticateSuperAdmin, async (req, res) => {
  try {
    const {
      name,
      businessCode,
      description,
      contactEmail,
      contactPhone,
      address,
      operatingHours,
      category,
      website,
      established,
      features,
      socialMedia,
      loyaltyBenefits
    } = req.body;

    // Validate required fields
    if (!name || !businessCode) {
      return res.status(400).json({
        success: false,
        message: 'Business name and code are required'
      });
    }

    // Check if business code already exists
    const existingBusiness = await Business.findOne({ where: { businessCode } });
    if (existingBusiness) {
      return res.status(400).json({
        success: false,
        message: 'Business code already exists'
      });
    }

    // Create new business
    const business = await Business.create({
      name,
      businessCode: businessCode.toUpperCase(),
      description,
      contactEmail,
      contactPhone,
      address,
      operatingHours,
      category,
      website,
      established,
      memberSince: new Date().getFullYear().toString(),
      features: features || [],
      socialMedia: socialMedia || {
        instagram: '',
        facebook: '',
        twitter: ''
      },
      loyaltyBenefits: loyaltyBenefits || []
    });

    res.status(201).json({
      success: true,
      message: 'Business created successfully',
      data: business
    });
  } catch (error) {
    console.error('Error creating business:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create business'
    });
  }
});

// Update a business (superadmin only)
router.put('/businesses/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name,
      businessCode,
      description,
      contactEmail,
      contactPhone,
      address,
      operatingHours,
      category,
      website,
      established,
      features,
      socialMedia,
      loyaltyBenefits
    } = req.body;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // If businessCode is being updated, check for duplicates
    if (businessCode && businessCode !== business.businessCode) {
      const existingBusiness = await Business.findOne({ 
        where: { businessCode: businessCode.toUpperCase() } 
      });
      if (existingBusiness) {
        return res.status(400).json({
          success: false,
          message: 'Business code already exists'
        });
      }
    }

    // Update business
    await business.update({
      name: name || business.name,
      businessCode: businessCode ? businessCode.toUpperCase() : business.businessCode,
      description: description !== undefined ? description : business.description,
      contactEmail: contactEmail !== undefined ? contactEmail : business.contactEmail,
      contactPhone: contactPhone !== undefined ? contactPhone : business.contactPhone,
      address: address !== undefined ? address : business.address,
      operatingHours: operatingHours || business.operatingHours,
      category: category !== undefined ? category : business.category,
      website: website !== undefined ? website : business.website,
      established: established !== undefined ? established : business.established,
      features: features || business.features,
      socialMedia: socialMedia || business.socialMedia,
      loyaltyBenefits: loyaltyBenefits || business.loyaltyBenefits
    });

    res.json({
      success: true,
      message: 'Business updated successfully',
      data: business
    });
  } catch (error) {
    console.error('Error updating business:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update business'
    });
  }
});

// Delete a business (superadmin only)
router.delete('/businesses/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Check if business has users (you might want to prevent deletion in this case)
    const userCount = await db.get(
      'SELECT COUNT(*) as count FROM user_businesses WHERE business_id = ?',
      [id]
    );

    if (userCount && userCount.count > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete business with ${userCount.count} active users. Please reassign users first.`
      });
    }

    await business.destroy();

    res.json({
      success: true,
      message: 'Business deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete business'
    });
  }
});

// Get a single business (superadmin only)
router.get('/businesses/:id', authenticateSuperAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const business = await Business.findByPk(id);
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Get user count for this business
    const userCount = await db.get(
      'SELECT COUNT(*) as count FROM user_businesses WHERE business_id = ?',
      [id]
    );

    res.json({
      success: true,
      data: {
        ...business.toJSON(),
        userCount: userCount ? userCount.count : 0
      }
    });
  } catch (error) {
    console.error('Error fetching business:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch business'
    });
  }
});

module.exports = router;