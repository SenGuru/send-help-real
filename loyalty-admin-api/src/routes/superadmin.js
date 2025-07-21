const express = require('express');
const router = express.Router();
const { authenticateSuperAdmin } = require('../middleware/superadminAuth');
const { User, Business, UserBusiness, Transaction, PointsTransaction, Admin } = require('../models');
const { QueryTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

// Get all users across all businesses (superadmin only)
router.get('/users', authenticateSuperAdmin, async (req, res) => {
  try {
    // Get all unique users
    const users = await sequelize.query(`
      SELECT 
        u.id,
        u.first_name,
        u.last_name,
        u.email,
        u.phone_number,
        u.date_of_birth,
        u.profile_image_url,
        u.is_active,
        u.last_login,
        u.created_at,
        u.updated_at
      FROM users u
      ORDER BY u.created_at DESC
    `, { type: QueryTypes.SELECT });

    // Get all business memberships for these users
    const memberships = await sequelize.query(`
      SELECT 
        ub.user_id,
        ub.member_id,
        ub.join_date,
        ub.total_points,
        ub.available_points,
        ub.lifetime_points,
        ub.last_activity,
        ub.is_active as membership_active,
        b.id as business_id,
        b.name as business_name,
        b.business_code,
        r.title as current_ranking,
        r.color as ranking_color
      FROM user_businesses ub
      JOIN business b ON ub.business_id = b.id
      LEFT JOIN rankings r ON ub.current_ranking_id = r.id
      ORDER BY ub.created_at DESC
    `, { type: QueryTypes.SELECT });

    // Group memberships by user
    const membershipsByUser = memberships.reduce((acc, membership) => {
      if (!acc[membership.user_id]) {
        acc[membership.user_id] = [];
      }
      acc[membership.user_id].push(membership);
      return acc;
    }, {});

    // Combine users with their business memberships
    const usersWithMemberships = users.map(user => ({
      ...user,
      memberships: membershipsByUser[user.id] || [],
      totalBusinesses: (membershipsByUser[user.id] || []).length,
      totalPoints: (membershipsByUser[user.id] || []).reduce((sum, m) => sum + (m.total_points || 0), 0),
      totalAvailablePoints: (membershipsByUser[user.id] || []).reduce((sum, m) => sum + (m.available_points || 0), 0)
    }));

    res.json({
      success: true,
      data: {
        users: usersWithMemberships,
        total: users.length,
        totalMemberships: memberships.length
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
  const transaction = await sequelize.transaction();
  
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
      loyaltyBenefits,
      // Admin credentials
      adminFirstName,
      adminLastName,
      adminEmail,
      adminPassword
    } = req.body;

    // Validate required business fields
    if (!name || !businessCode) {
      return res.status(400).json({
        success: false,
        message: 'Business name and code are required'
      });
    }

    // Validate required admin fields
    if (!adminFirstName || !adminLastName || !adminEmail || !adminPassword) {
      return res.status(400).json({
        success: false,
        message: 'Admin first name, last name, email, and password are required'
      });
    }

    // Validate admin password length
    if (adminPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Admin password must be at least 6 characters long'
      });
    }

    // Validate admin email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(adminEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid admin email address'
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

    // Check if admin email already exists
    const existingAdmin = await Admin.findOne({ where: { email: adminEmail } });
    if (existingAdmin) {
      return res.status(400).json({
        success: false,
        message: 'Admin email already exists'
      });
    }

    // Create new business within transaction
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
    }, { transaction });

    // Create admin account for the business within transaction
    const admin = await Admin.create({
      businessId: business.id,
      email: adminEmail,
      password: adminPassword,
      firstName: adminFirstName,
      lastName: adminLastName,
      isActive: true
    }, { transaction });

    // Commit the transaction
    await transaction.commit();

    res.status(201).json({
      success: true,
      message: 'Business and admin account created successfully',
      data: {
        business,
        admin: {
          id: admin.id,
          email: admin.email,
          firstName: admin.firstName,
          lastName: admin.lastName,
          isActive: admin.isActive
        }
      }
    });
  } catch (error) {
    // Rollback the transaction in case of error
    await transaction.rollback();
    
    console.error('Error creating business and admin:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Duplicate entry error',
        details: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create business and admin account'
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

// Import admin accounts from CSV (superadmin only)
router.post('/admin-csv-import', authenticateSuperAdmin, async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { admins } = req.body;
    
    if (!admins || !Array.isArray(admins)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid admin data provided'
      });
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < admins.length; i++) {
      const adminData = admins[i];
      
      try {
        // Find business by handle (without @)
        const businessHandle = adminData.business_handle.replace('@', '');
        const business = await Business.findOne({ 
          where: { businessCode: businessHandle.toUpperCase() } 
        });
        
        if (!business) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Business with handle ${adminData.business_handle} not found`);
          continue;
        }

        // Check if admin email already exists
        const existingAdmin = await Admin.findOne({ 
          where: { email: adminData.admin_email } 
        });
        
        if (existingAdmin) {
          results.failed++;
          results.errors.push(`Row ${i + 1}: Admin email ${adminData.admin_email} already exists`);
          continue;
        }

        // Create admin account
        await Admin.create({
          businessId: business.id,
          email: adminData.admin_email,
          password: adminData.admin_password, // Will be hashed by model hook
          firstName: adminData.admin_first_name,
          lastName: adminData.admin_last_name,
          isActive: adminData.is_active === true || adminData.is_active === 'true'
        }, { transaction });

        results.successful++;
        
      } catch (error) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    await transaction.commit();

    res.json({
      success: true,
      message: `Import completed: ${results.successful} successful, ${results.failed} failed`,
      data: results
    });

  } catch (error) {
    await transaction.rollback();
    console.error('Error importing admin CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to import admin data'
    });
  }
});

// Export admin accounts to CSV (superadmin only)
router.get('/admin-csv-export', authenticateSuperAdmin, async (req, res) => {
  try {
    const admins = await sequelize.query(`
      SELECT 
        CONCAT('@', b.business_code) as business_handle,
        a.email as admin_email,
        a.first_name as admin_first_name,
        a.last_name as admin_last_name,
        '****' as admin_password,
        a.is_active,
        DATE(a.created_at) as created_date
      FROM admins a
      JOIN business b ON a.business_id = b.id
      ORDER BY a.created_at DESC
    `, { type: QueryTypes.SELECT });

    // Convert to CSV
    const headers = [
      'business_handle',
      'admin_email', 
      'admin_first_name',
      'admin_last_name',
      'admin_password',
      'is_active',
      'created_date'
    ];

    const csvContent = [
      headers.join(','),
      ...admins.map(admin => [
        admin.business_handle,
        admin.admin_email,
        admin.admin_first_name,
        admin.admin_last_name,
        admin.admin_password,
        admin.is_active,
        admin.created_date
      ].join(','))
    ].join('\n');

    res.json({
      success: true,
      csv: csvContent,
      count: admins.length
    });

  } catch (error) {
    console.error('Error exporting admin CSV:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export admin data'
    });
  }
});

module.exports = router;