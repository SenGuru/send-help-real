const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserPointTier = sequelize.define('UserPointTier', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  businessId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'business_id',
    references: {
      model: 'business',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    }
  },
  currentTierId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'current_tier_id',
    references: {
      model: 'point_tiers',
      key: 'id'
    }
  },
  tierPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'tier_points',
    validate: {
      min: 0
    }
  },
  lifetimeTierPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'lifetime_tier_points',
    validate: {
      min: 0
    }
  },
  lastTierUpdate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_tier_update'
  },
  tierHistory: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    field: 'tier_history'
  }
}, {
  tableName: 'user_point_tiers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['business_id', 'user_id']
    },
    {
      fields: ['business_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['current_tier_id']
    },
    {
      fields: ['tier_points']
    }
  ]
});

// Instance methods
UserPointTier.prototype.getCurrentTier = async function() {
  if (this.currentTierId) {
    return await sequelize.models.PointTier.findByPk(this.currentTierId);
  }
  return null;
};

UserPointTier.prototype.getNextTier = async function() {
  const PointTier = sequelize.models.PointTier;
  return await PointTier.getNextTierForPoints(this.businessId, this.tierPoints);
};

UserPointTier.prototype.getProgressToNextTier = async function() {
  const nextTier = await this.getNextTier();
  if (!nextTier) {
    return { isMaxTier: true, progress: 100, pointsNeeded: 0 };
  }
  
  const currentTier = await this.getCurrentTier();
  const currentThreshold = currentTier ? currentTier.pointsRequired : 0;
  const nextThreshold = nextTier.pointsRequired;
  const tierRange = nextThreshold - currentThreshold;
  const pointsInCurrentTier = this.tierPoints - currentThreshold;
  const progress = tierRange > 0 ? Math.min((pointsInCurrentTier / tierRange) * 100, 100) : 100;
  const pointsNeeded = Math.max(nextThreshold - this.tierPoints, 0);
  
  return {
    isMaxTier: false,
    progress,
    pointsNeeded,
    nextTier,
    currentTierPoints: pointsInCurrentTier,
    pointsForNextTier: tierRange
  };
};

UserPointTier.prototype.addTierPoints = async function(points, description = 'Points earned') {
  const oldTierPoints = this.tierPoints;
  const newTierPoints = oldTierPoints + points;
  
  // Update points
  await this.update({
    tierPoints: newTierPoints,
    lifetimeTierPoints: this.lifetimeTierPoints + points
  });
  
  // Check for tier upgrade
  const newTier = await this.checkAndUpdateTier();
  
  return {
    oldTierPoints,
    newTierPoints,
    pointsAdded: points,
    tierUpgraded: !!newTier,
    newTier
  };
};

UserPointTier.prototype.checkAndUpdateTier = async function() {
  const PointTier = sequelize.models.PointTier;
  const newTier = await PointTier.getCurrentTierForPoints(this.businessId, this.tierPoints);
  
  if (newTier && (!this.currentTierId || newTier.id !== this.currentTierId)) {
    const oldTierId = this.currentTierId;
    
    // Add to tier history
    const tierHistory = [...(this.tierHistory || [])];
    tierHistory.push({
      tierId: newTier.id,
      tierName: newTier.name,
      achievedAt: new Date(),
      pointsAtAchievement: this.tierPoints,
      previousTierId: oldTierId
    });
    
    // Update current tier
    await this.update({
      currentTierId: newTier.id,
      lastTierUpdate: new Date(),
      tierHistory
    });
    
    return newTier;
  }
  
  return null;
};

// Static methods
UserPointTier.findOrCreateForUser = async function(businessId, userId) {
  const [userTier] = await this.findOrCreate({
    where: { businessId, userId },
    defaults: {
      businessId,
      userId,
      tierPoints: 0,
      lifetimeTierPoints: 0
    }
  });
  
  return userTier;
};

UserPointTier.getBusinessTierStats = async function(businessId) {
  const stats = await this.findAll({
    where: { businessId },
    include: [{
      model: sequelize.models.PointTier,
      as: 'currentTier',
      required: false
    }],
    attributes: [
      'currentTierId',
      [sequelize.fn('COUNT', '*'), 'userCount'],
      [sequelize.fn('AVG', sequelize.col('tier_points')), 'avgPoints']
    ],
    group: ['currentTierId', 'currentTier.id'],
    order: [[sequelize.col('currentTier.tier_level'), 'ASC']]
  });
  
  return stats;
};

module.exports = UserPointTier;