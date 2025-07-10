const { User, PointsTransaction, Transaction, Ranking } = require('../models');
const { Op } = require('sequelize');

// Get user's points balance and history
const getPointsBalance = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findByPk(userId, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }],
      attributes: ['id', 'totalPoints', 'availablePoints', 'lifetimePoints', 'currentRankingId']
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get next ranking
    const nextRanking = await user.getNextRanking();
    const pointsToNext = nextRanking ? nextRanking.pointsRequired - user.totalPoints : 0;

    res.json({
      success: true,
      data: {
        totalPoints: user.totalPoints,
        availablePoints: user.availablePoints,
        lifetimePoints: user.lifetimePoints,
        currentRanking: user.currentRanking,
        nextRanking,
        pointsToNextRanking: Math.max(0, pointsToNext)
      }
    });

  } catch (error) {
    console.error('Get points balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get points transaction history
const getPointsHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId };

    // Filter by transaction type
    if (type) {
      whereClause.type = type;
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: transactions } = await PointsTransaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: Transaction,
        as: 'transaction',
        attributes: ['transactionId', 'storeName', 'totalAmount']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        transactions: transactions.map(pt => ({
          id: pt.id,
          type: pt.type,
          points: pt.points,
          description: pt.description,
          referenceType: pt.referenceType,
          referenceId: pt.referenceId,
          balanceBefore: pt.balanceBefore,
          balanceAfter: pt.balanceAfter,
          multiplier: pt.multiplier,
          createdAt: pt.createdAt,
          expiresAt: pt.expiresAt,
          isReversed: pt.isReversed,
          transaction: pt.transaction,
          formattedPoints: pt.getFormattedPoints(),
          formattedDate: pt.getFormattedDate(),
          isEarned: pt.isEarned(),
          isRedeemed: pt.isRedeemed()
        })),
        pagination: {
          currentPage: parseInt(page),
          totalPages,
          totalRecords: count,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      }
    });

  } catch (error) {
    console.error('Get points history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get points expiring soon
const getExpiringPoints = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { days = 30 } = req.query;

    const warningDate = new Date();
    warningDate.setDate(warningDate.getDate() + parseInt(days));

    const expiringPoints = await PointsTransaction.findAll({
      where: {
        userId,
        points: { [Op.gt]: 0 }, // Only earned points can expire
        expiresAt: {
          [Op.lte]: warningDate,
          [Op.gt]: new Date() // Not already expired
        },
        isReversed: false
      },
      order: [['expiresAt', 'ASC']]
    });

    const totalExpiringPoints = expiringPoints.reduce((sum, pt) => sum + pt.points, 0);

    res.json({
      success: true,
      data: {
        expiringPoints: expiringPoints.map(pt => ({
          id: pt.id,
          points: pt.points,
          description: pt.description,
          expiresAt: pt.expiresAt,
          daysUntilExpiry: Math.ceil((new Date(pt.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)),
          formattedDate: pt.getFormattedDate()
        })),
        totalExpiringPoints,
        warningDays: parseInt(days)
      }
    });

  } catch (error) {
    console.error('Get expiring points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Manual points adjustment (admin only)
const adjustPoints = async (req, res) => {
  try {
    const { userId, points, description, type = 'earned_manual' } = req.body;

    // Validate required fields
    if (!userId || !points || !description) {
      return res.status(400).json({
        success: false,
        message: 'User ID, points, and description are required'
      });
    }

    // Validate points value
    if (points === 0) {
      return res.status(400).json({
        success: false,
        message: 'Points adjustment cannot be zero'
      });
    }

    // Find user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check if this is a deduction and user has enough points
    if (points < 0 && user.availablePoints < Math.abs(points)) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points for deduction'
      });
    }

    let pointsTransaction;

    if (points > 0) {
      // Points addition
      pointsTransaction = await PointsTransaction.createEarnedTransaction({
        userId,
        businessId: req.user.businessId,
        points,
        description,
        referenceType: 'manual',
        referenceId: `manual_${Date.now()}`
      });
    } else {
      // Points deduction
      pointsTransaction = await PointsTransaction.createRedeemedTransaction({
        userId,
        businessId: req.user.businessId,
        points: Math.abs(points),
        description,
        referenceType: 'manual',
        referenceId: `manual_${Date.now()}`
      });
    }

    // Get updated user data
    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }]
    });

    res.json({
      success: true,
      message: 'Points adjusted successfully',
      data: {
        pointsTransaction: {
          id: pointsTransaction.id,
          type: pointsTransaction.type,
          points: pointsTransaction.points,
          description: pointsTransaction.description,
          balanceBefore: pointsTransaction.balanceBefore,
          balanceAfter: pointsTransaction.balanceAfter,
          createdAt: pointsTransaction.createdAt
        },
        user: {
          id: updatedUser.id,
          totalPoints: updatedUser.totalPoints,
          availablePoints: updatedUser.availablePoints,
          lifetimePoints: updatedUser.lifetimePoints,
          currentRanking: updatedUser.currentRanking
        }
      }
    });

  } catch (error) {
    console.error('Adjust points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get points earning summary
const getPointsEarningSummary = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { period = 'monthly' } = req.query; // 'daily', 'weekly', 'monthly', 'yearly'

    let dateFormat, groupBy;
    switch (period) {
      case 'daily':
        dateFormat = 'YYYY-MM-DD';
        groupBy = PointsTransaction.sequelize.fn('DATE', PointsTransaction.sequelize.col('created_at'));
        break;
      case 'weekly':
        dateFormat = 'YYYY-WW';
        groupBy = PointsTransaction.sequelize.fn('DATE_TRUNC', 'week', PointsTransaction.sequelize.col('created_at'));
        break;
      case 'yearly':
        dateFormat = 'YYYY';
        groupBy = PointsTransaction.sequelize.fn('DATE_TRUNC', 'year', PointsTransaction.sequelize.col('created_at'));
        break;
      default: // monthly
        dateFormat = 'YYYY-MM';
        groupBy = PointsTransaction.sequelize.fn('DATE_TRUNC', 'month', PointsTransaction.sequelize.col('created_at'));
    }

    const pointsSummary = await PointsTransaction.findAll({
      where: {
        userId,
        createdAt: {
          [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
        }
      },
      attributes: [
        [groupBy, 'period'],
        [PointsTransaction.sequelize.fn('SUM', PointsTransaction.sequelize.literal('CASE WHEN points > 0 THEN points ELSE 0 END')), 'earned'],
        [PointsTransaction.sequelize.fn('SUM', PointsTransaction.sequelize.literal('CASE WHEN points < 0 THEN ABS(points) ELSE 0 END')), 'redeemed'],
        [PointsTransaction.sequelize.fn('COUNT', PointsTransaction.sequelize.literal('CASE WHEN points > 0 THEN 1 END')), 'earningTransactions'],
        [PointsTransaction.sequelize.fn('COUNT', PointsTransaction.sequelize.literal('CASE WHEN points < 0 THEN 1 END')), 'redemptionTransactions']
      ],
      group: [groupBy],
      order: [[groupBy, 'DESC']],
      limit: 12,
      raw: true
    });

    res.json({
      success: true,
      data: {
        period,
        summary: pointsSummary.map(item => ({
          period: item.period,
          earned: parseInt(item.earned || 0),
          redeemed: parseInt(item.redeemed || 0),
          net: parseInt(item.earned || 0) - parseInt(item.redeemed || 0),
          earningTransactions: parseInt(item.earningTransactions || 0),
          redemptionTransactions: parseInt(item.redemptionTransactions || 0),
          totalTransactions: parseInt(item.earningTransactions || 0) + parseInt(item.redemptionTransactions || 0)
        }))
      }
    });

  } catch (error) {
    console.error('Get points earning summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get points leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { period = 'all_time', limit = 10 } = req.query;

    let whereClause = { businessId };

    // Filter by time period
    if (period !== 'all_time') {
      const now = new Date();
      let startDate;

      switch (period) {
        case 'this_month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        case 'this_year':
          startDate = new Date(now.getFullYear(), 0, 1);
          break;
        case 'last_30_days':
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = null;
      }

      if (startDate) {
        whereClause.createdAt = { [Op.gte]: startDate };
      }
    }

    // Get top users by points earned in the period
    let orderBy, selectField;
    if (period === 'all_time') {
      orderBy = [['lifetimePoints', 'DESC']];
      selectField = 'lifetimePoints';
    } else {
      // For time-based periods, we need to sum points from transactions
      const users = await User.findAll({
        where: { businessId },
        include: [{
          model: PointsTransaction,
          as: 'pointsTransactions',
          where: whereClause,
          attributes: [],
          required: false
        }, {
          model: Ranking,
          as: 'currentRanking',
          attributes: ['title', 'color', 'level']
        }],
        attributes: [
          'id', 'firstName', 'lastName', 'totalPoints', 'lifetimePoints',
          [PointsTransaction.sequelize.fn('SUM', PointsTransaction.sequelize.literal('CASE WHEN points_transactions.points > 0 THEN points_transactions.points ELSE 0 END')), 'periodPoints']
        ],
        group: ['User.id', 'currentRanking.id'],
        order: [[PointsTransaction.sequelize.literal('periodPoints'), 'DESC']],
        limit: parseInt(limit)
      });

      return res.json({
        success: true,
        data: {
          period,
          leaderboard: users.map((user, index) => ({
            rank: index + 1,
            user: {
              id: user.id,
              name: `${user.firstName} ${user.lastName}`,
              firstName: user.firstName,
              lastName: user.lastName
            },
            points: parseInt(user.dataValues.periodPoints || 0),
            totalPoints: user.totalPoints,
            lifetimePoints: user.lifetimePoints,
            ranking: user.currentRanking
          }))
        }
      });
    }

    // For all_time leaderboard
    const users = await User.findAll({
      where: { businessId },
      include: [{
        model: Ranking,
        as: 'currentRanking',
        attributes: ['title', 'color', 'level']
      }],
      attributes: ['id', 'firstName', 'lastName', 'totalPoints', 'lifetimePoints'],
      order: orderBy,
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      data: {
        period,
        leaderboard: users.map((user, index) => ({
          rank: index + 1,
          user: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName
          },
          points: user[selectField],
          totalPoints: user.totalPoints,
          lifetimePoints: user.lifetimePoints,
          ranking: user.currentRanking
        }))
      }
    });

  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin-only functions for points management
const awardPointsToUser = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId, points, description, expiresInDays = 365 } = req.body;

    // Validate required fields
    if (!userId || !points || !description) {
      return res.status(400).json({
        success: false,
        message: 'User ID, points, and description are required'
      });
    }

    // Find user
    const user = await User.findOne({
      where: { id: userId, businessId }
    });
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Create points transaction
    const pointsTransaction = await PointsTransaction.createEarnedTransaction({
      userId,
      businessId,
      points: parseInt(points),
      description,
      referenceType: 'admin_award',
      referenceId: `admin_${Date.now()}`,
      expiresInDays: parseInt(expiresInDays)
    });

    // Get updated user data
    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }]
    });

    res.json({
      success: true,
      message: 'Points awarded successfully',
      data: {
        pointsTransaction: {
          id: pointsTransaction.id,
          points: pointsTransaction.points,
          description: pointsTransaction.description,
          balanceAfter: pointsTransaction.balanceAfter,
          createdAt: pointsTransaction.createdAt
        },
        user: {
          id: updatedUser.id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          totalPoints: updatedUser.totalPoints,
          availablePoints: updatedUser.availablePoints,
          currentRanking: updatedUser.currentRanking
        }
      }
    });

  } catch (error) {
    console.error('Award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const bulkAwardPoints = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userIds, points, description, type = 'award' } = req.body;

    // Validate required fields
    if (!userIds || !Array.isArray(userIds) || !points || !description) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array, points, and description are required'
      });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        // Find user
        const user = await User.findOne({
          where: { id: userId, businessId }
        });

        if (!user) {
          errors.push({ userId, error: 'User not found' });
          continue;
        }

        // Check if deducting points and user has enough
        if (type === 'deduct' && user.availablePoints < Math.abs(points)) {
          errors.push({ userId, error: 'Insufficient points for deduction' });
          continue;
        }

        let pointsTransaction;
        if (type === 'award') {
          pointsTransaction = await PointsTransaction.createEarnedTransaction({
            userId,
            businessId,
            points: parseInt(points),
            description,
            referenceType: 'admin_bulk',
            referenceId: `bulk_${Date.now()}`
          });
        } else {
          pointsTransaction = await PointsTransaction.createRedeemedTransaction({
            userId,
            businessId,
            points: Math.abs(parseInt(points)),
            description,
            referenceType: 'admin_bulk',
            referenceId: `bulk_${Date.now()}`
          });
        }

        results.push({
          userId,
          success: true,
          transactionId: pointsTransaction.id,
          newBalance: pointsTransaction.balanceAfter
        });

      } catch (error) {
        errors.push({ userId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Bulk operation completed. ${results.length} successful, ${errors.length} failed.`,
      data: {
        successful: results,
        failed: errors,
        summary: {
          total: userIds.length,
          successful: results.length,
          failed: errors.length
        }
      }
    });

  } catch (error) {
    console.error('Bulk award points error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getAllPointsTransactions = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { page = 1, limit = 50, userId, type, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;
    let whereClause = { businessId };

    // Add filters
    if (userId) whereClause.userId = userId;
    if (type && type !== 'all') whereClause.type = type;
    
    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) whereClause.createdAt[Op.gte] = new Date(startDate);
      if (endDate) whereClause.createdAt[Op.lte] = new Date(endDate);
    }

    const { count, rows: transactions } = await PointsTransaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      transactions,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalTransactions: count,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get all points transactions error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const getPointsStatistics = async (req, res) => {
  try {
    const businessId = req.admin.businessId;

    // Get simple counts first - much safer
    const totalPointsAwarded = await PointsTransaction.sum('points', {
      where: { 
        businessId,
        points: { [Op.gt]: 0 }
      }
    }) || 0;

    const totalPointsRedeemed = await PointsTransaction.sum('points', {
      where: { 
        businessId,
        points: { [Op.lt]: 0 }
      }
    }) || 0;

    const activeUsers = await User.count({
      where: { 
        businessId,
        isActive: true 
      }
    });

    const avgBalance = await User.findAll({
      where: { businessId },
      attributes: [
        [User.sequelize.fn('AVG', User.sequelize.col('available_points')), 'avgBalance']
      ],
      raw: true
    });

    // Get top 5 users by total points (simpler query)
    const topEarners = await User.findAll({
      where: { businessId },
      attributes: ['id', 'firstName', 'lastName', 'email', 'totalPoints'],
      order: [['totalPoints', 'DESC']],
      limit: 5
    });

    // Get recent transactions (simpler query)
    const recentTransactions = await PointsTransaction.findAll({
      where: { businessId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['firstName', 'lastName', 'email']
      }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.json({
      success: true,
      data: {
        totalPointsAwarded: Math.abs(totalPointsAwarded),
        totalPointsRedeemed: Math.abs(totalPointsRedeemed),
        activeUsers,
        averagePointBalance: parseFloat(avgBalance[0]?.avgBalance || 0),
        topEarners: topEarners.map(user => ({
          user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
          },
          points: user.totalPoints
        })),
        recentTransactions: recentTransactions || [],
        pointsDistribution: []
      }
    });

  } catch (error) {
    console.error('Get points statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  getPointsBalance,
  getPointsHistory,
  getExpiringPoints,
  adjustPoints,
  getPointsEarningSummary,
  getLeaderboard,
  // Admin functions
  awardPointsToUser,
  bulkAwardPoints,
  getAllPointsTransactions,
  getPointsStatistics
};