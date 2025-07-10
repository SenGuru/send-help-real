const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Reward = sequelize.define('Reward', {
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
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  pointsCost: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'points_cost',
    validate: {
      min: 1
    }
  },
  type: {
    type: DataTypes.ENUM('free_item', 'discount_percentage', 'discount_amount', 'free_shipping', 'upgrade', 'experience', 'other'),
    allowNull: false,
    defaultValue: 'free_item'
  },
  value: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    comment: 'For discounts: percentage or amount. For free items: retail value'
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url'
  },
  termsAndConditions: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'terms_and_conditions'
  },
  validFrom: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'valid_from',
    defaultValue: DataTypes.NOW
  },
  validUntil: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'valid_until'
  },
  maxRedemptions: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_redemptions',
    validate: {
      min: 1
    }
  },
  currentRedemptions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'current_redemptions',
    validate: {
      min: 0
    }
  },
  maxRedemptionsPerUser: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'max_redemptions_per_user',
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  minimumRankingLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'minimum_ranking_level',
    validate: {
      min: 1
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  isFeatured: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_featured'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sort_order'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  }
}, {
  tableName: 'rewards',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['business_id']
    },
    {
      fields: ['points_cost']
    },
    {
      fields: ['type']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['valid_from', 'valid_until']
    },
    {
      fields: ['business_id', 'is_active', 'sort_order']
    }
  ]
});

// Instance methods
Reward.prototype.isAvailable = function() {
  const now = new Date();
  
  // Check if reward is active
  if (!this.isActive) return false;
  
  // Check if reward is within valid date range
  if (this.validFrom && now < this.validFrom) return false;
  if (this.validUntil && now > this.validUntil) return false;
  
  // Check if redemption limit reached
  if (this.maxRedemptions && this.currentRedemptions >= this.maxRedemptions) return false;
  
  return true;
};

Reward.prototype.canUserRedeem = async function(userId) {
  if (!this.isAvailable()) return false;
  
  // Check user's ranking level
  if (this.minimumRankingLevel) {
    const user = await sequelize.models.User.findByPk(userId, {
      include: [{
        model: sequelize.models.Ranking,
        as: 'currentRanking'
      }]
    });
    
    if (!user || !user.currentRanking || user.currentRanking.level < this.minimumRankingLevel) {
      return false;
    }
    
    // Check if user has enough points
    if (user.availablePoints < this.pointsCost) return false;
  }
  
  // Check per-user redemption limit
  if (this.maxRedemptionsPerUser) {
    const userRedemptions = await sequelize.models.PointsTransaction.count({
      where: {
        userId,
        referenceId: this.id.toString(),
        referenceType: 'reward',
        type: 'redeemed_reward'
      }
    });
    
    if (userRedemptions >= this.maxRedemptionsPerUser) return false;
  }
  
  return true;
};

Reward.prototype.getFormattedValue = function() {
  if (!this.value) return null;
  
  switch (this.type) {
    case 'discount_percentage':
      return `${this.value}% OFF`;
    case 'discount_amount':
      return `$${this.value} OFF`;
    case 'free_item':
      return `Worth $${this.value}`;
    default:
      return this.value.toString();
  }
};

Reward.prototype.getExpiryText = function() {
  if (!this.validUntil) return 'No expiry';
  
  const now = new Date();
  const expiry = new Date(this.validUntil);
  const diffTime = expiry - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'Expired';
  if (diffDays === 1) return 'Expires tomorrow';
  if (diffDays <= 7) return `Expires in ${diffDays} days`;
  
  return `Expires ${expiry.toLocaleDateString()}`;
};

// Static methods
Reward.getAvailableForUser = async function(userId, businessId) {
  const user = await sequelize.models.User.findByPk(userId, {
    include: [{
      model: sequelize.models.Ranking,
      as: 'currentRanking'
    }]
  });
  
  if (!user) return [];
  
  const now = new Date();
  const whereClause = {
    businessId,
    isActive: true,
    validFrom: { [sequelize.Op.lte]: now }
  };
  
  if (user.currentRanking) {
    whereClause[sequelize.Op.or] = [
      { minimumRankingLevel: null },
      { minimumRankingLevel: { [sequelize.Op.lte]: user.currentRanking.level } }
    ];
  } else {
    whereClause.minimumRankingLevel = null;
  }
  
  const rewards = await this.findAll({
    where: whereClause,
    order: [['isFeatured', 'DESC'], ['sortOrder', 'ASC'], ['pointsCost', 'ASC']]
  });
  
  // Filter out rewards that user can't redeem
  const availableRewards = [];
  for (const reward of rewards) {
    if (await reward.canUserRedeem(userId)) {
      availableRewards.push(reward);
    }
  }
  
  return availableRewards;
};

module.exports = Reward;