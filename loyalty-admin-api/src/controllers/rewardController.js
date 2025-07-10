const { Reward, User, PointsTransaction, Ranking } = require('../models');
const { Op } = require('sequelize');

// Get available rewards for user
const getAvailableRewards = async (req, res) => {
  try {
    const userId = req.user.userId;
    const businessId = req.user.businessId;
    const { category, minPoints, maxPoints, featured } = req.query;

    // Get user to check ranking and points
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

    // Build where clause
    const whereClause = {
      businessId,
      isActive: true,
      validFrom: { [Op.lte]: new Date() }
    };

    // Add optional filters
    if (category) whereClause.type = category;
    if (minPoints) whereClause.pointsCost = { ...whereClause.pointsCost, [Op.gte]: parseInt(minPoints) };
    if (maxPoints) whereClause.pointsCost = { ...whereClause.pointsCost, [Op.lte]: parseInt(maxPoints) };
    if (featured === 'true') whereClause.isFeatured = true;

    // Filter by valid until date
    whereClause[Op.or] = [
      { validUntil: null },
      { validUntil: { [Op.gt]: new Date() } }
    ];

    // Filter by ranking requirement
    if (user.currentRanking) {
      whereClause[Op.or] = [
        { minimumRankingLevel: null },
        { minimumRankingLevel: { [Op.lte]: user.currentRanking.level } }
      ];
    } else {
      whereClause.minimumRankingLevel = null;
    }

    const rewards = await Reward.findAll({
      where: whereClause,
      order: [
        ['isFeatured', 'DESC'],
        ['sortOrder', 'ASC'],
        ['pointsCost', 'ASC']
      ]
    });

    // Check availability for each reward
    const availableRewards = [];
    for (const reward of rewards) {
      const canRedeem = await reward.canUserRedeem(userId);
      
      availableRewards.push({
        id: reward.id,
        title: reward.title,
        description: reward.description,
        pointsCost: reward.pointsCost,
        type: reward.type,
        value: reward.value,
        imageUrl: reward.imageUrl,
        termsAndConditions: reward.termsAndConditions,
        validUntil: reward.validUntil,
        maxRedemptions: reward.maxRedemptions,
        currentRedemptions: reward.currentRedemptions,
        maxRedemptionsPerUser: reward.maxRedemptionsPerUser,
        minimumRankingLevel: reward.minimumRankingLevel,
        isFeatured: reward.isFeatured,
        canRedeem,
        canAfford: user.availablePoints >= reward.pointsCost,
        formattedValue: reward.getFormattedValue(),
        expiryText: reward.getExpiryText(),
        isAvailable: reward.isAvailable()
      });
    }

    res.json({
      success: true,
      data: {
        rewards: availableRewards,
        userPoints: user.availablePoints,
        userRanking: user.currentRanking
      }
    });

  } catch (error) {
    console.error('Get available rewards error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get reward details
const getRewardDetails = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const userId = req.user.userId;

    const reward = await Reward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if user can redeem this reward
    const canRedeem = await reward.canUserRedeem(userId);

    // Get user's redemption history for this reward
    const userRedemptions = await PointsTransaction.findAll({
      where: {
        userId,
        referenceId: rewardId.toString(),
        referenceType: 'reward',
        type: 'redeemed_reward'
      },
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    // Get user points
    const user = await User.findByPk(userId, {
      attributes: ['availablePoints'],
      include: [{
        model: Ranking,
        as: 'currentRanking',
        attributes: ['title', 'level']
      }]
    });

    res.json({
      success: true,
      data: {
        reward: {
          id: reward.id,
          title: reward.title,
          description: reward.description,
          pointsCost: reward.pointsCost,
          type: reward.type,
          value: reward.value,
          imageUrl: reward.imageUrl,
          termsAndConditions: reward.termsAndConditions,
          validFrom: reward.validFrom,
          validUntil: reward.validUntil,
          maxRedemptions: reward.maxRedemptions,
          currentRedemptions: reward.currentRedemptions,
          maxRedemptionsPerUser: reward.maxRedemptionsPerUser,
          minimumRankingLevel: reward.minimumRankingLevel,
          isFeatured: reward.isFeatured,
          formattedValue: reward.getFormattedValue(),
          expiryText: reward.getExpiryText(),
          isAvailable: reward.isAvailable()
        },
        userInfo: {
          canRedeem,
          canAfford: user.availablePoints >= reward.pointsCost,
          availablePoints: user.availablePoints,
          currentRanking: user.currentRanking,
          redemptionHistory: userRedemptions.map(pt => ({
            id: pt.id,
            points: pt.points,
            description: pt.description,
            createdAt: pt.createdAt,
            formattedDate: pt.getFormattedDate()
          }))
        }
      }
    });

  } catch (error) {
    console.error('Get reward details error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Redeem a reward
const redeemReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const userId = req.user.userId;
    const businessId = req.user.businessId;

    // Get reward
    const reward = await Reward.findByPk(rewardId);
    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if reward is available
    if (!reward.isAvailable()) {
      return res.status(400).json({
        success: false,
        message: 'Reward is not currently available'
      });
    }

    // Check if user can redeem this reward
    const canRedeem = await reward.canUserRedeem(userId);
    if (!canRedeem) {
      return res.status(400).json({
        success: false,
        message: 'You are not eligible to redeem this reward'
      });
    }

    // Get user to verify points balance
    const user = await User.findByPk(userId);
    if (user.availablePoints < reward.pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient points to redeem this reward'
      });
    }

    // Create redemption points transaction
    const pointsTransaction = await PointsTransaction.createRedeemedTransaction({
      userId,
      businessId,
      points: reward.pointsCost,
      description: `Redeemed: ${reward.title}`,
      referenceId: rewardId.toString(),
      referenceType: 'reward'
    });

    // Update reward redemption count
    await reward.increment('currentRedemptions');

    // Get updated user data
    const updatedUser = await User.findByPk(userId, {
      include: [{
        model: Ranking,
        as: 'currentRanking'
      }]
    });

    // Generate redemption code
    const redemptionCode = `${reward.type.toUpperCase()}-${Date.now()}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    res.json({
      success: true,
      message: 'Reward redeemed successfully',
      data: {
        redemption: {
          id: pointsTransaction.id,
          redemptionCode,
          reward: {
            id: reward.id,
            title: reward.title,
            description: reward.description,
            pointsCost: reward.pointsCost,
            type: reward.type,
            value: reward.value,
            formattedValue: reward.getFormattedValue()
          },
          pointsRedeemed: reward.pointsCost,
          balanceBefore: pointsTransaction.balanceBefore,
          balanceAfter: pointsTransaction.balanceAfter,
          redeemedAt: pointsTransaction.createdAt,
          formattedDate: pointsTransaction.getFormattedDate()
        },
        user: {
          totalPoints: updatedUser.totalPoints,
          availablePoints: updatedUser.availablePoints,
          currentRanking: updatedUser.currentRanking
        }
      }
    });

  } catch (error) {
    console.error('Redeem reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Get user's redemption history
const getRedemptionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 20, type } = req.query;

    const offset = (page - 1) * limit;
    const whereClause = {
      userId,
      type: 'redeemed_reward'
    };

    // Filter by reward type
    if (type) {
      // Get reward IDs of specific type
      const rewardIds = await Reward.findAll({
        where: { type, businessId: req.user.businessId },
        attributes: ['id']
      });
      
      whereClause.referenceId = {
        [Op.in]: rewardIds.map(r => r.id.toString())
      };
    }

    const { count, rows: redemptions } = await PointsTransaction.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    // Get reward details for each redemption
    const redemptionHistory = [];
    for (const redemption of redemptions) {
      const reward = await Reward.findByPk(redemption.referenceId);
      
      redemptionHistory.push({
        id: redemption.id,
        pointsRedeemed: Math.abs(redemption.points),
        description: redemption.description,
        redeemedAt: redemption.createdAt,
        formattedDate: redemption.getFormattedDate(),
        reward: reward ? {
          id: reward.id,
          title: reward.title,
          type: reward.type,
          imageUrl: reward.imageUrl,
          formattedValue: reward.getFormattedValue()
        } : null
      });
    }

    const totalPages = Math.ceil(count / limit);

    res.json({
      success: true,
      data: {
        redemptions: redemptionHistory,
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
    console.error('Get redemption history error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Create new reward
const createReward = async (req, res) => {
  try {
    const {
      title,
      description,
      pointsCost,
      type = 'free_item',
      value,
      imageUrl,
      termsAndConditions,
      validFrom,
      validUntil,
      maxRedemptions,
      maxRedemptionsPerUser = 1,
      minimumRankingLevel,
      isFeatured = false,
      sortOrder = 0
    } = req.body;

    const businessId = req.user.businessId;

    // Validate required fields
    if (!title || !description || !pointsCost) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and points cost are required'
      });
    }

    if (pointsCost < 1) {
      return res.status(400).json({
        success: false,
        message: 'Points cost must be at least 1'
      });
    }

    const reward = await Reward.create({
      businessId,
      title,
      description,
      pointsCost,
      type,
      value,
      imageUrl,
      termsAndConditions,
      validFrom: validFrom || new Date(),
      validUntil,
      maxRedemptions,
      maxRedemptionsPerUser,
      minimumRankingLevel,
      isFeatured,
      sortOrder
    });

    res.status(201).json({
      success: true,
      message: 'Reward created successfully',
      data: { reward }
    });

  } catch (error) {
    console.error('Create reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Update reward
const updateReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const businessId = req.user.businessId;

    const reward = await Reward.findOne({
      where: { id: rewardId, businessId }
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    const allowedUpdates = [
      'title', 'description', 'pointsCost', 'type', 'value', 'imageUrl',
      'termsAndConditions', 'validFrom', 'validUntil', 'maxRedemptions',
      'maxRedemptionsPerUser', 'minimumRankingLevel', 'isActive', 'isFeatured', 'sortOrder'
    ];

    const updates = {};
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    await reward.update(updates);

    res.json({
      success: true,
      message: 'Reward updated successfully',
      data: { reward }
    });

  } catch (error) {
    console.error('Update reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Admin: Delete reward
const deleteReward = async (req, res) => {
  try {
    const { rewardId } = req.params;
    const businessId = req.user.businessId;

    const reward = await Reward.findOne({
      where: { id: rewardId, businessId }
    });

    if (!reward) {
      return res.status(404).json({
        success: false,
        message: 'Reward not found'
      });
    }

    // Check if reward has been redeemed
    const redemptionCount = await PointsTransaction.count({
      where: {
        referenceId: rewardId.toString(),
        referenceType: 'reward',
        type: 'redeemed_reward'
      }
    });

    if (redemptionCount > 0) {
      // Don't delete if there are redemptions, just deactivate
      await reward.update({ isActive: false });
      
      return res.json({
        success: true,
        message: 'Reward deactivated (cannot delete due to existing redemptions)',
        data: { reward }
      });
    }

    await reward.destroy();

    res.json({
      success: true,
      message: 'Reward deleted successfully'
    });

  } catch (error) {
    console.error('Delete reward error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  getAvailableRewards,
  getRewardDetails,
  redeemReward,
  getRedemptionHistory,
  createReward,
  updateReward,
  deleteReward
};