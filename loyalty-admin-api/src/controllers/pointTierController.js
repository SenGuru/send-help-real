const PointTier = require('../models/PointTier');
const UserPointTier = require('../models/UserPointTier');
const User = require('../models/User');

// Get all point tiers for a business
const getPointTiers = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    
    const tiers = await PointTier.findAll({
      where: { businessId },
      order: [['tierLevel', 'ASC']]
    });

    res.json({
      success: true,
      tiers
    });

  } catch (error) {
    console.error('Get point tiers error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve point tiers'
    });
  }
};

// Create or update point tier
const upsertPointTier = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { 
      tierLevel, 
      name, 
      pointsRequired, 
      description, 
      rewards, 
      color, 
      iconUrl 
    } = req.body;

    // Check if tier already exists
    let tier = await PointTier.findOne({
      where: { businessId, tierLevel }
    });

    if (tier) {
      // Update existing tier
      await tier.update({
        name,
        pointsRequired,
        description,
        rewards,
        color,
        iconUrl
      });
    } else {
      // Create new tier
      tier = await PointTier.create({
        businessId,
        tierLevel,
        name,
        pointsRequired,
        description,
        rewards,
        color,
        iconUrl,
        sortOrder: tierLevel
      });
    }

    res.json({
      success: true,
      message: tier.isNewRecord ? 'Point tier created successfully' : 'Point tier updated successfully',
      tier
    });

  } catch (error) {
    console.error('Upsert point tier error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to save point tier'
    });
  }
};

// Delete point tier
const deletePointTier = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { tierLevel } = req.params;

    const tier = await PointTier.findOne({
      where: { businessId, tierLevel: parseInt(tierLevel) }
    });

    if (!tier) {
      return res.status(404).json({
        error: 'Tier not found',
        message: 'Point tier not found'
      });
    }

    // Check if any users are currently in this tier
    const usersInTier = await UserPointTier.count({
      where: { businessId, currentTierId: tier.id }
    });

    if (usersInTier > 0) {
      return res.status(400).json({
        error: 'Tier in use',
        message: `Cannot delete tier. ${usersInTier} users are currently in this tier.`
      });
    }

    await tier.destroy();

    res.json({
      success: true,
      message: 'Point tier deleted successfully'
    });

  } catch (error) {
    console.error('Delete point tier error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete point tier'
    });
  }
};

// Get tier statistics
const getTierStats = async (req, res) => {
  try {
    const businessId = req.admin.businessId;

    const stats = await UserPointTier.getBusinessTierStats(businessId);
    
    // Get total users for percentage calculation
    const totalUsers = await UserPointTier.count({
      where: { businessId }
    });

    const tierStats = stats.map(stat => ({
      tierId: stat.currentTierId,
      tierName: stat.currentTier ? stat.currentTier.name : 'No Tier',
      userCount: parseInt(stat.dataValues.userCount),
      percentage: totalUsers > 0 ? ((parseInt(stat.dataValues.userCount) / totalUsers) * 100).toFixed(1) : 0,
      avgPoints: stat.dataValues.avgPoints ? parseFloat(stat.dataValues.avgPoints).toFixed(0) : 0
    }));

    res.json({
      success: true,
      stats: tierStats,
      totalUsers
    });

  } catch (error) {
    console.error('Get tier stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve tier statistics'
    });
  }
};

// Award tier points to user
const awardTierPoints = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId, points, description } = req.body;

    // Find or create user point tier record
    const userTier = await UserPointTier.findOrCreateForUser(businessId, userId);
    
    // Add points and check for tier upgrade
    const result = await userTier.addTierPoints(points, description);

    res.json({
      success: true,
      message: 'Tier points awarded successfully',
      result
    });

  } catch (error) {
    console.error('Award tier points error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to award tier points'
    });
  }
};

// Get user tier progress
const getUserTierProgress = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId } = req.params;

    const userTier = await UserPointTier.findOrCreateForUser(businessId, userId);
    const currentTier = await userTier.getCurrentTier();
    const progress = await userTier.getProgressToNextTier();

    res.json({
      success: true,
      userTier: {
        tierPoints: userTier.tierPoints,
        lifetimeTierPoints: userTier.lifetimeTierPoints,
        currentTier,
        progress,
        tierHistory: userTier.tierHistory
      }
    });

  } catch (error) {
    console.error('Get user tier progress error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve user tier progress'
    });
  }
};

// Bulk update all user tiers (recalculate based on current points)
const recalculateAllTiers = async (req, res) => {
  try {
    const businessId = req.admin.businessId;

    const userTiers = await UserPointTier.findAll({
      where: { businessId }
    });

    let upgradedCount = 0;
    for (const userTier of userTiers) {
      const newTier = await userTier.checkAndUpdateTier();
      if (newTier) {
        upgradedCount++;
      }
    }

    res.json({
      success: true,
      message: `Tier recalculation completed. ${upgradedCount} users upgraded.`,
      upgradedCount,
      totalUsers: userTiers.length
    });

  } catch (error) {
    console.error('Recalculate tiers error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to recalculate tiers'
    });
  }
};

module.exports = {
  getPointTiers,
  upsertPointTier,
  deletePointTier,
  getTierStats,
  awardTierPoints,
  getUserTierProgress,
  recalculateAllTiers
};