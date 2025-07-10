const { Transaction, User, PointsTransaction, Ranking } = require('../models');
const { Op } = require('sequelize');

// Create a new transaction and award points
const createTransaction = async (req, res) => {
  try {
    const {
      totalAmount,
      subtotal,
      tax = 0,
      discount = 0,
      paymentMethod = 'credit_card',
      storeName,
      storeLocation,
      cashierId,
      receiptNumber,
      items = [],
      metadata = {}
    } = req.body;

    const userId = req.user.userId;
    const businessId = req.user.businessId;

    // Validate required fields
    if (!totalAmount || !subtotal) {
      return res.status(400).json({
        success: false,
        message: 'Total amount and subtotal are required'
      });
    }

    if (totalAmount < 0 || subtotal < 0) {
      return res.status(400).json({
        success: false,
        message: 'Amounts cannot be negative'
      });
    }

    // Get user to check ranking for points multiplier
    const user = await User.findByPk(userId, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }]
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Calculate points earned
    const basePointsPerDollar = 2; // Default: 2 points per dollar
    let pointsMultiplier = 1.0;

    // Apply ranking multiplier
    if (user.currentRanking) {
      switch (user.currentRanking.level) {
        case 1: pointsMultiplier = 1.0; break; // Bronze
        case 2: pointsMultiplier = 1.5; break; // Silver
        case 3: pointsMultiplier = 2.0; break; // Gold
        case 4: pointsMultiplier = 2.5; break; // Platinum
        default: pointsMultiplier = 1.0;
      }
    }

    const basePoints = Math.floor(totalAmount * basePointsPerDollar);
    const pointsEarned = Math.floor(basePoints * pointsMultiplier);

    // Create transaction
    const transaction = await Transaction.create({
      businessId,
      userId,
      totalAmount,
      subtotal,
      tax,
      discount,
      pointsEarned,
      paymentMethod,
      status: 'completed', // Assuming successful payment
      storeName,
      storeLocation,
      cashierId,
      receiptNumber,
      items,
      metadata
    });

    // Create points transaction if points were earned
    let pointsTransaction = null;
    if (pointsEarned > 0) {
      pointsTransaction = await PointsTransaction.createEarnedTransaction({
        userId,
        businessId,
        transactionId: transaction.id,
        points: pointsEarned,
        description: `Purchase at ${storeName || 'store'}`,
        referenceId: transaction.transactionId,
        referenceType: 'transaction',
        multiplier: pointsMultiplier
      });
    }

    // Get updated user data
    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Transaction created successfully',
      data: {
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          totalAmount: transaction.totalAmount,
          pointsEarned: transaction.pointsEarned,
          status: transaction.status,
          transactionDate: transaction.transactionDate,
          storeName: transaction.storeName,
          items: transaction.items,
          formattedAmount: transaction.getFormattedAmount(),
          formattedDate: transaction.getFormattedDate()
        },
        pointsTransaction: pointsTransaction ? {
          id: pointsTransaction.id,
          points: pointsTransaction.points,
          description: pointsTransaction.description,
          multiplier: pointsTransaction.multiplier,
          balanceAfter: pointsTransaction.balanceAfter
        } : null,
        user: {
          totalPoints: updatedUser.totalPoints,
          availablePoints: updatedUser.availablePoints,
          lifetimePoints: updatedUser.lifetimePoints,
          currentRanking: updatedUser.currentRanking
        }
      }
    });

  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's transaction history
const getTransactionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, status, startDate, endDate } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = { userId };

    // Filter by status
    if (status) {
      whereClause.status = status;
    }

    // Filter by date range
    if (startDate || endDate) {
      whereClause.transactionDate = {};
      if (startDate) whereClause.transactionDate[Op.gte] = new Date(startDate);
      if (endDate) whereClause.transactionDate[Op.lte] = new Date(endDate);
    }

    const { count, rows: transactions } = await Transaction.findAndCountAll({
      where: whereClause,
      include: [{
        model: PointsTransaction,
        as: 'pointsTransactions',
        where: { type: 'earned_purchase' },
        required: false
      }],
      order: [['transactionDate', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        transactions: transactions.map(t => ({
          id: t.id,
          transactionId: t.transactionId,
          totalAmount: t.totalAmount,
          subtotal: t.subtotal,
          tax: t.tax,
          discount: t.discount,
          pointsEarned: t.pointsEarned,
          paymentMethod: t.paymentMethod,
          status: t.status,
          transactionDate: t.transactionDate,
          storeName: t.storeName,
          storeLocation: t.storeLocation,
          items: t.items,
          formattedAmount: t.getFormattedAmount(),
          formattedDate: t.getFormattedDate(),
          pointsTransactions: t.pointsTransactions
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
    console.error('Get transaction history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get transaction details
const getTransactionDetails = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user.userId;

    const transaction = await Transaction.findOne({
      where: {
        id: transactionId,
        userId
      },
      include: [{
        model: PointsTransaction,
        as: 'pointsTransactions'
      }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: {
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          totalAmount: transaction.totalAmount,
          subtotal: transaction.subtotal,
          tax: transaction.tax,
          discount: transaction.discount,
          pointsEarned: transaction.pointsEarned,
          paymentMethod: transaction.paymentMethod,
          status: transaction.status,
          transactionDate: transaction.transactionDate,
          storeName: transaction.storeName,
          storeLocation: transaction.storeLocation,
          cashierId: transaction.cashierId,
          receiptNumber: transaction.receiptNumber,
          items: transaction.items,
          metadata: transaction.metadata,
          formattedAmount: transaction.getFormattedAmount(),
          formattedDate: transaction.getFormattedDate(),
          pointsTransactions: transaction.pointsTransactions.map(pt => ({
            id: pt.id,
            type: pt.type,
            points: pt.points,
            description: pt.description,
            multiplier: pt.multiplier,
            balanceBefore: pt.balanceBefore,
            balanceAfter: pt.balanceAfter,
            createdAt: pt.createdAt
          }))
        }
      }
    });

  } catch (error) {
    console.error('Get transaction details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Process refund (admin only)
const processRefund = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { reason, refundAmount } = req.body;

    // Find transaction
    const transaction = await Transaction.findByPk(transactionId, {
      include: [{
        model: PointsTransaction,
        as: 'pointsTransactions',
        where: { type: 'earned_purchase' }
      }]
    });

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    if (transaction.status === 'refunded') {
      return res.status(400).json({
        success: false,
        message: 'Transaction already refunded'
      });
    }

    const actualRefundAmount = refundAmount || transaction.totalAmount;

    // Update transaction status
    await transaction.update({
      status: 'refunded',
      refundedAt: new Date(),
      refundReason: reason
    });

    // Reverse points if any were earned
    if (transaction.pointsTransactions && transaction.pointsTransactions.length > 0) {
      const pointsToReverse = transaction.pointsTransactions[0].points;

      // Create reversal points transaction
      await PointsTransaction.createRedeemedTransaction({
        userId: transaction.userId,
        businessId: transaction.businessId,
        points: pointsToReverse,
        description: `Refund reversal for transaction ${transaction.transactionId}`,
        referenceId: transaction.transactionId,
        referenceType: 'refund'
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
      data: {
        transaction: {
          id: transaction.id,
          transactionId: transaction.transactionId,
          status: transaction.status,
          refundedAt: transaction.refundedAt,
          refundReason: transaction.refundReason,
          refundAmount: actualRefundAmount
        }
      }
    });

  } catch (error) {
    console.error('Process refund error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get transaction statistics
const getTransactionStats = async (req, res) => {
  try {
    const businessId = req.user.businessId;
    const { period = 'monthly', userId } = req.query;

    let whereClause = { businessId };
    if (userId) {
      whereClause.userId = userId;
    }

    // Get overall statistics
    const overallStats = await Transaction.findAll({
      where: whereClause,
      attributes: [
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'totalTransactions'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('total_amount')), 'totalRevenue'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('points_earned')), 'totalPointsAwarded'],
        [Transaction.sequelize.fn('AVG', Transaction.sequelize.col('total_amount')), 'averageTransactionValue']
      ],
      raw: true
    });

    // Get periodic statistics
    let dateFormat, groupBy;
    switch (period) {
      case 'daily':
        groupBy = Transaction.sequelize.fn('DATE', Transaction.sequelize.col('transaction_date'));
        break;
      case 'weekly':
        groupBy = Transaction.sequelize.fn('DATE_TRUNC', 'week', Transaction.sequelize.col('transaction_date'));
        break;
      case 'yearly':
        groupBy = Transaction.sequelize.fn('DATE_TRUNC', 'year', Transaction.sequelize.col('transaction_date'));
        break;
      default: // monthly
        groupBy = Transaction.sequelize.fn('DATE_TRUNC', 'month', Transaction.sequelize.col('transaction_date'));
    }

    const periodicStats = await Transaction.findAll({
      where: {
        ...whereClause,
        transactionDate: {
          [Op.gte]: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) // Last year
        }
      },
      attributes: [
        [groupBy, 'period'],
        [Transaction.sequelize.fn('COUNT', Transaction.sequelize.col('id')), 'transactions'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('total_amount')), 'revenue'],
        [Transaction.sequelize.fn('SUM', Transaction.sequelize.col('points_earned')), 'pointsAwarded'],
        [Transaction.sequelize.fn('AVG', Transaction.sequelize.col('total_amount')), 'averageValue']
      ],
      group: [groupBy],
      order: [[groupBy, 'DESC']],
      limit: 12,
      raw: true
    });

    res.json({
      success: true,
      data: {
        overall: {
          totalTransactions: parseInt(overallStats[0]?.totalTransactions || 0),
          totalRevenue: parseFloat(overallStats[0]?.totalRevenue || 0),
          totalPointsAwarded: parseInt(overallStats[0]?.totalPointsAwarded || 0),
          averageTransactionValue: parseFloat(overallStats[0]?.averageTransactionValue || 0)
        },
        periodic: periodicStats.map(stat => ({
          period: stat.period,
          transactions: parseInt(stat.transactions),
          revenue: parseFloat(stat.revenue),
          pointsAwarded: parseInt(stat.pointsAwarded),
          averageValue: parseFloat(stat.averageValue)
        })),
        period
      }
    });

  } catch (error) {
    console.error('Get transaction stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createTransaction,
  getTransactionHistory,
  getTransactionDetails,
  processRefund,
  getTransactionStats
};