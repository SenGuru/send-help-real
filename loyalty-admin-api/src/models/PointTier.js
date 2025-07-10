const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointTier = sequelize.define('PointTier', {
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
  tierLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'tier_level',
    validate: {
      min: 1,
      max: 4
    }
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  pointsRequired: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'points_required',
    validate: {
      min: 0
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  rewards: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: [],
    validate: {
      isValidRewards(value) {
        if (!Array.isArray(value)) {
          throw new Error('Rewards must be an array');
        }
        for (const reward of value) {
          if (typeof reward !== 'object' || !reward.type || !reward.value) {
            throw new Error('Each reward must have type and value properties');
          }
        }
      }
    }
  },
  color: {
    type: DataTypes.STRING(7),
    allowNull: true,
    validate: {
      is: /^#[0-9A-F]{6}$/i
    },
    defaultValue: '#9CAF88'
  },
  iconUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'icon_url'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  sortOrder: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'sort_order'
  }
}, {
  tableName: 'point_tiers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['business_id', 'tier_level']
    },
    {
      fields: ['business_id']
    },
    {
      fields: ['points_required']
    },
    {
      fields: ['sort_order']
    }
  ]
});

// Instance methods
PointTier.prototype.getFormattedPoints = function() {
  return this.pointsRequired.toLocaleString();
};

PointTier.prototype.getRewardSummary = function() {
  if (!this.rewards || this.rewards.length === 0) {
    return 'No rewards';
  }
  return this.rewards.map(reward => {
    switch (reward.type) {
      case 'discount':
        return `${reward.value}% discount`;
      case 'freeItem':
        return `Free ${reward.value}`;
      case 'pointMultiplier':
        return `${reward.value}x points`;
      case 'freeShipping':
        return 'Free shipping';
      case 'earlyAccess':
        return 'Early access to sales';
      case 'birthday':
        return `Birthday ${reward.value}`;
      case 'custom':
        return reward.value;
      default:
        return reward.value;
    }
  }).join(', ');
};

// Static methods
PointTier.getBusinessTiers = async function(businessId) {
  return await this.findAll({
    where: { 
      businessId,
      isActive: true
    },
    order: [['tierLevel', 'ASC']]
  });
};

PointTier.getNextTierForPoints = async function(businessId, points) {
  return await this.findOne({
    where: {
      businessId,
      pointsRequired: {
        [sequelize.Sequelize.Op.gt]: points
      },
      isActive: true
    },
    order: [['pointsRequired', 'ASC']]
  });
};

PointTier.getCurrentTierForPoints = async function(businessId, points) {
  return await this.findOne({
    where: {
      businessId,
      pointsRequired: {
        [sequelize.Sequelize.Op.lte]: points
      },
      isActive: true
    },
    order: [['pointsRequired', 'DESC']]
  });
};

module.exports = PointTier;