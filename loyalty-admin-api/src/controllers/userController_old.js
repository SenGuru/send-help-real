const jwt = require('jsonwebtoken');
const { User, Business, Ranking, Transaction, PointsTransaction } = require('../models');
const { Op } = require('sequelize');

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { 
      userId: user.id, 
      businessId: user.businessId,
      email: user.email 
    },
    process.env.JWT_SECRET || 'loyalty_app_secret',
    { expiresIn: '30d' }
  );
};

// Register new user
const register = async (req, res) => {
  try {
    const { businessCode, firstName, lastName, email, password, phoneNumber, dateOfBirth } = req.body;

    // Validate required fields
    if (!businessCode || !firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Business code, first name, last name, email, and password are required'
      });
    }

    // Find business by business code
    const business = await Business.findOne({ where: { businessCode: businessCode.toUpperCase() } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Invalid business code'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: {
        businessId: business.id,
        email: email.toLowerCase()
      }
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Get the lowest ranking for new users
    const initialRanking = await Ranking.findOne({
      where: { businessId: business.id },
      order: [['pointsRequired', 'ASC']]
    });

    // Generate member ID
    const userCount = await User.count({ where: { businessId: business.id } });
    const memberId = `${business.businessCode}${String(userCount + 1).padStart(6, '0')}`;
    
    console.log('Generated memberId:', memberId);
    console.log('Business code:', business.businessCode);
    console.log('User count:', userCount);
    
    const userData = {
      businessId: business.id,
      memberId,
      firstName,
      lastName,
      email: email.toLowerCase(),
      password,
      phoneNumber,
      dateOfBirth,
      currentRankingId: initialRanking ? initialRanking.id : null
    };
    
    console.log('User data to create:', userData);
    
    // Create new user
    const user = await User.create(userData);

    // Create welcome bonus points transaction
    if (initialRanking) {
      await PointsTransaction.createEarnedTransaction({
        userId: user.id,
        businessId: business.id,
        points: 100, // Welcome bonus
        description: 'Welcome bonus points',
        referenceType: 'bonus',
        referenceId: 'welcome_bonus'
      });
    }

    // Generate token
    const token = generateToken(user);

    // Return user data (excluding password)
    const userResponseData = {
      id: user.id,
      memberId: user.memberId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      totalPoints: user.totalPoints,
      availablePoints: user.availablePoints,
      lifetimePoints: user.lifetimePoints,
      currentRankingId: user.currentRankingId,
      joinDate: user.joinDate,
      isActive: user.isActive,
      preferences: user.preferences
    };

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userResponseData,
        token,
        business: {
          id: business.id,
          name: business.name,
          businessCode: business.businessCode
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { businessCode, email, password } = req.body;

    // Validate required fields
    if (!businessCode || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Business code, email, and password are required'
      });
    }

    // Find business
    const business = await Business.findOne({ where: { businessCode: businessCode.toUpperCase() } });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Invalid business code'
      });
    }

    // Find user
    const user = await User.findOne({
      where: {
        businessId: business.id,
        email: email.toLowerCase()
      },
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }]
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Validate password
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check if user is active
    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Please contact support.'
      });
    }

    // Update last activity
    await user.update({ lastActivity: new Date() });

    // Generate token
    const token = generateToken(user);

    // Return user data (excluding password)
    const userData = {
      id: user.id,
      memberId: user.memberId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      dateOfBirth: user.dateOfBirth,
      totalPoints: user.totalPoints,
      availablePoints: user.availablePoints,
      lifetimePoints: user.lifetimePoints,
      currentRankingId: user.currentRankingId,
      currentRanking: user.currentRanking,
      joinDate: user.joinDate,
      lastActivity: user.lastActivity,
      isActive: user.isActive,
      preferences: user.preferences
    };

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: userData,
        token,
        business: {
          id: business.id,
          name: business.name,
          businessCode: business.businessCode
        }
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during login'
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get next ranking
    const nextRanking = await user.getNextRanking();

    res.json({
      success: true,
      data: {
        user,
        nextRanking
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, dateOfBirth, preferences } = req.body;

    const user = await User.findByPk(req.user.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update allowed fields
    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (dateOfBirth) updateData.dateOfBirth = dateOfBirth;
    if (preferences) updateData.preferences = { ...user.preferences, ...preferences };

    await user.update(updateData);

    // Return updated user data (excluding password)
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user statistics
const getUserStats = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get transaction statistics
    const transactionStats = await Transaction.findAll({
      where: { userId },
      attributes: [
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'totalTransactions'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('total_amount')), 'totalSpent'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('points_earned')), 'totalPointsEarned']
      ],
      raw: true
    });

    // Get points statistics
    const pointsStats = await PointsTransaction.findAll({
      where: { userId },
      attributes: [
        [PointsTransaction.sequelize.fn('SUM', PointsTransaction.sequelize.literal('CASE WHEN points > 0 THEN points ELSE 0 END')), 'totalEarned'],
        [PointsTransaction.sequelize.fn('SUM', PointsTransaction.sequelize.literal('CASE WHEN points < 0 THEN ABS(points) ELSE 0 END')), 'totalRedeemed'],
        [PointsTransaction.sequelize.fn('COUNT', PointsTransaction.sequelize.literal('CASE WHEN points > 0 THEN 1 END')), 'earningTransactions'],
        [PointsTransaction.sequelize.fn('COUNT', PointsTransaction.sequelize.literal('CASE WHEN points < 0 THEN 1 END')), 'redemptionTransactions']
      ],
      raw: true
    });

    // Get monthly statistics for current year
    const currentYear = new Date().getFullYear();
    const monthlyStats = await Transaction.findAll({
      where: {
        userId,
        transactionDate: {
          [Op.gte]: new Date(`${currentYear}-01-01`),
          [Op.lt]: new Date(`${currentYear + 1}-01-01`)
        }
      },
      attributes: [
        [Transaction.sequelize.fn('EXTRACT', Transaction.sequelize.literal('MONTH FROM transaction_date')), 'month'],
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'transactions'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('total_amount')), 'spent'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('points_earned')), 'pointsEarned']
      ],
      group: [Transaction.sequelize.fn('EXTRACT', Transaction.sequelize.literal('MONTH FROM transaction_date'))],
      order: [[Transaction.sequelize.fn('EXTRACT', Transaction.sequelize.literal('MONTH FROM transaction_date')), 'ASC']],
      raw: true
    });

    res.json({
      success: true,
      data: {
        summary: {
          totalTransactions: parseInt(transactionStats[0]?.totalTransactions || 0),
          totalSpent: parseFloat(transactionStats[0]?.totalSpent || 0),
          totalPointsEarned: parseInt(pointsStats[0]?.totalEarned || 0),
          totalPointsRedeemed: parseInt(pointsStats[0]?.totalRedeemed || 0),
          earningTransactions: parseInt(pointsStats[0]?.earningTransactions || 0),
          redemptionTransactions: parseInt(pointsStats[0]?.redemptionTransactions || 0)
        },
        monthlyStats: monthlyStats.map(stat => ({
          month: parseInt(stat.month),
          transactions: parseInt(stat.transactions),
          spent: parseFloat(stat.spent),
          pointsEarned: parseInt(stat.pointsEarned)
        }))
      }
    });

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin-only functions for user management
const getAllUsers = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { page = 1, limit = 50, search, status } = req.query;
    
    const offset = (page - 1) * limit;
    let whereClause = { businessId };
    
    // Add search filter
    if (search) {
      whereClause[Op.or] = [
        { firstName: { [Op.like]: `%${search}%` } },
        { lastName: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }
    
    // Add status filter
    if (status && status !== 'all') {
      whereClause.isActive = status === 'active';
    }

    const { count, rows: users } = await User.findAndCountAll({
      where: whereClause,
      include: [{
        model: Ranking,
        as: 'currentRanking',
        attributes: ['id', 'title', 'level', 'color']
      }],
      attributes: { exclude: ['password'] },
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId } = req.params;

    const user = await User.findOne({
      where: { 
        id: userId, 
        businessId 
      },
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get next ranking
    const nextRanking = await user.getNextRanking();

    res.json({
      success: true,
      user,
      nextRanking
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUserStatus = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId } = req.params;
    const { isActive } = req.body;

    const user = await User.findOne({
      where: { 
        id: userId, 
        businessId 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await user.update({ isActive });

    res.json({
      success: true,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: {
        id: user.id,
        isActive: user.isActive
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const updateUserDetails = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId } = req.params;
    const { firstName, lastName, email, phoneNumber, isActive } = req.body;

    const user = await User.findOne({
      where: { 
        id: userId, 
        businessId 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if email is being updated and if it's already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: {
          businessId,
          email: email.toLowerCase(),
          id: { [Op.ne]: userId }
        }
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists for another user'
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;
    if (isActive !== undefined) updateData.isActive = isActive;

    await user.update(updateData);

    // Return updated user data (excluding password)
    const updatedUser = await User.findByPk(user.id, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }],
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'User updated successfully',
      user: updatedUser
    });

  } catch (error) {
    console.error('Update user details error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors.map(e => e.message)
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const deleteUser = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId } = req.params;

    const user = await User.findOne({
      where: { 
        id: userId, 
        businessId 
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Store user info for response
    const userInfo = {
      id: user.id,
      memberId: user.memberId,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email
    };

    // Delete the user (this will cascade to related records)
    await user.destroy();

    res.json({
      success: true,
      message: 'User deleted successfully',
      deletedUser: userInfo
    });

  } catch (error) {
    console.error('Delete user error:', error);
    
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete user due to existing transactions or related records'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getUserStats,
  // Admin functions
  getAllUsers,
  getUserById,
  updateUserStatus,
  updateUserDetails,
  deleteUser
};