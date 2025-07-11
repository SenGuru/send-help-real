const express = require('express');
const router = express.Router();
const { authenticateSuperAdmin } = require('../middleware/superadminAuth');
const { User, Business, UserBusiness, Transaction, PointsTransaction } = require('../models');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');

// Get all users across all businesses (superadmin only)
router.get('/users', authenticateSuperAdmin, async (req, res) => {
  try {
    const users = await sequelize.query(`
      SELECT 
        u.*,
        b.name as business_name,
        b.business_code as business_code,
        ub.created_at as joined_business_at
      FROM users u
      LEFT JOIN user_businesses ub ON u.id = ub.user_id
      LEFT JOIN business b ON ub.business_id = b.id
      ORDER BY u.created_at DESC
    `, { type: QueryTypes.SELECT });

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
    const businesses = await sequelize.query(`
      SELECT 
        b.*,
        COUNT(ub.user_id) as user_count
      FROM business b
      LEFT JOIN user_businesses ub ON b.id = ub.business_id
      GROUP BY b.id
      ORDER BY b.created_at DESC
    `, { type: QueryTypes.SELECT });

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
    // Use raw queries for now to avoid model issues
    const [totalUsersResult] = await sequelize.query('SELECT COUNT(*) as count FROM users', { type: QueryTypes.SELECT });
    const [totalBusinessesResult] = await sequelize.query('SELECT COUNT(*) as count FROM business', { type: QueryTypes.SELECT });
    const [totalTransactionsResult] = await sequelize.query('SELECT COUNT(*) as count FROM transactions', { type: QueryTypes.SELECT });
    const [totalPointsResult] = await sequelize.query('SELECT SUM(points) as total FROM points_transactions WHERE type = "earned"', { type: QueryTypes.SELECT });
    
    // Users created today
    const today = new Date().toISOString().split('T')[0];
    const [usersTodayResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE DATE(created_at) = ?', { 
      replacements: [today], 
      type: QueryTypes.SELECT 
    });
    
    // Users created this week
    const [usersThisWeekResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE created_at >= datetime("now", "-7 days")', { type: QueryTypes.SELECT });
    
    // Users created this month
    const [usersThisMonthResult] = await sequelize.query('SELECT COUNT(*) as count FROM users WHERE created_at >= datetime("now", "-30 days")', { type: QueryTypes.SELECT });

    res.json({
      success: true,
      data: {
        totalUsers: totalUsersResult.count || 0,
        totalBusinesses: totalBusinessesResult.count || 0,
        totalTransactions: totalTransactionsResult.count || 0,
        totalPoints: totalPointsResult.total || 0,
        usersToday: usersTodayResult.count || 0,
        usersThisWeek: usersThisWeekResult.count || 0,
        usersThisMonth: usersThisMonthResult.count || 0
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
    const userCount = await UserBusiness.count({
      where: { businessId: id }
    });

    if (userCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete business with ${userCount} active users. Please reassign users first.`
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
    const userCount = await UserBusiness.count({
      where: { businessId: id }
    });

    res.json({
      success: true,
      data: {
        ...business.toJSON(),
        userCount: userCount
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

// Get recent user activities (superadmin only)
router.get('/recent-activities', authenticateSuperAdmin, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    // Get recent user registrations with business info using raw query
    const recentUsers = await sequelize.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.created_at,
        b.name as business_name,
        b.business_code as business_code
      FROM users u
      LEFT JOIN user_businesses ub ON u.id = ub.user_id
      LEFT JOIN business b ON ub.business_id = b.id
      ORDER BY u.created_at DESC
      LIMIT ?
    `, { 
      replacements: [parseInt(limit)], 
      type: QueryTypes.SELECT 
    });
    
    // Get recent business memberships
    const recentMemberships = await sequelize.query(`
      SELECT 
        u.first_name,
        u.last_name,
        u.email,
        b.name as business_name,
        b.business_code as business_code,
        ub.created_at as joined_at
      FROM user_businesses ub
      JOIN users u ON ub.user_id = u.id
      JOIN business b ON ub.business_id = b.id
      ORDER BY ub.created_at DESC
      LIMIT ?
    `, { 
      replacements: [parseInt(limit)], 
      type: QueryTypes.SELECT 
    });

    res.json({
      success: true,
      data: {
        recentUsers: recentUsers,
        recentMemberships: recentMemberships
      }
    });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch recent activities'
    });
  }
});

// Get user growth analytics (superadmin only)
router.get('/user-analytics', authenticateSuperAdmin, async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const { Op } = require('sequelize');
    
    // Get daily user registrations for the last N days using raw query
    const dailyRegistrations = await sequelize.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count
      FROM users
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, { type: QueryTypes.SELECT });
    
    // Get user registrations by business
    const usersByBusiness = await sequelize.query(`
      SELECT 
        b.name as business_name,
        b.business_code,
        COUNT(ub.user_id) as user_count
      FROM business b
      LEFT JOIN user_businesses ub ON b.id = ub.business_id
      GROUP BY b.id, b.name, b.business_code
      ORDER BY user_count DESC
    `, { type: QueryTypes.SELECT });
    
    // Get weekly growth comparison
    const thisWeekStart = new Date();
    thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(lastWeekStart.getDate() - 7);
    const lastWeekEnd = new Date(thisWeekStart);
    
    const thisWeekUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: thisWeekStart
        }
      }
    });
    
    const lastWeekUsers = await User.count({
      where: {
        createdAt: {
          [Op.gte]: lastWeekStart,
          [Op.lt]: lastWeekEnd
        }
      }
    });

    res.json({
      success: true,
      data: {
        dailyRegistrations,
        usersByBusiness,
        weeklyGrowth: {
          thisWeek: thisWeekUsers,
          lastWeek: lastWeekUsers,
          percentageChange: lastWeekUsers > 0 
            ? ((thisWeekUsers - lastWeekUsers) / lastWeekUsers * 100).toFixed(1)
            : thisWeekUsers > 0 ? '100.0' : '0'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user analytics'
    });
  }
});

module.exports = router;