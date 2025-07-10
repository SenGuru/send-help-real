const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const PointsTransaction = sequelize.define('PointsTransaction', {
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
  transactionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'transaction_id',
    references: {
      model: 'transactions',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.ENUM(
      'earned_purchase',      // Points earned from purchase
      'earned_bonus',         // Bonus points (birthday, referral, etc.)
      'earned_manual',        // Manually awarded by admin
      'redeemed_coupon',      // Points spent on coupon
      'redeemed_reward',      // Points spent on reward
      'redeemed_manual',      // Manual deduction by admin
      'expired',              // Points expired
      'refunded',             // Points refunded due to return
      'transferred_in',       // Points transferred from another account
      'transferred_out'       // Points transferred to another account
    ),
    allowNull: false
  },
  points: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notZero: function(value) {
        if (value === 0) {
          throw new Error('Points cannot be zero');
        }
      }
    }
  },
  description: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  referenceId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'reference_id'
  },
  referenceType: {
    type: DataTypes.ENUM('transaction', 'coupon', 'reward', 'promotion', 'manual', 'referral', 'birthday', 'other'),
    allowNull: true,
    field: 'reference_type'
  },
  balanceBefore: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'balance_before',
    validate: {
      min: 0
    }
  },
  balanceAfter: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'balance_after',
    validate: {
      min: 0
    }
  },
  multiplier: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 1.0,
    validate: {
      min: 0
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expires_at'
  },
  processedBy: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'processed_by'
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  isReversed: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_reversed'
  },
  reversedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'reversed_at'
  },
  reversalReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'reversal_reason'
  }
}, {
  tableName: 'points_transactions',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['business_id']
    },
    {
      fields: ['user_id']
    },
    {
      fields: ['transaction_id']
    },
    {
      fields: ['type']
    },
    {
      fields: ['reference_id', 'reference_type']
    },
    {
      fields: ['created_at']
    },
    {
      fields: ['expires_at']
    },
    {
      fields: ['business_id', 'user_id', 'created_at']
    }
  ]
});

// Instance methods
PointsTransaction.prototype.isEarned = function() {
  return this.points > 0;
};

PointsTransaction.prototype.isRedeemed = function() {
  return this.points < 0;
};

PointsTransaction.prototype.getFormattedPoints = function() {
  const sign = this.points > 0 ? '+' : '';
  return `${sign}${this.points} pts`;
};

PointsTransaction.prototype.getFormattedDate = function() {
  return this.createdAt.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

PointsTransaction.prototype.isExpired = function() {
  return this.expiresAt && new Date() > this.expiresAt;
};

PointsTransaction.prototype.isExpiringSoon = function(days = 30) {
  if (!this.expiresAt) return false;
  const warningDate = new Date();
  warningDate.setDate(warningDate.getDate() + days);
  return this.expiresAt <= warningDate;
};

// Static methods
PointsTransaction.createEarnedTransaction = async function(data) {
  const { userId, businessId, points, description, referenceId, referenceType, transactionId, multiplier = 1.0, expiresAt } = data;
  
  // Get current user balance
  const user = await sequelize.models.User.findByPk(userId);
  if (!user) throw new Error('User not found');
  
  const balanceBefore = user.availablePoints;
  const balanceAfter = balanceBefore + points;
  
  // Create points transaction record
  const pointsTransaction = await this.create({
    businessId,
    userId,
    transactionId,
    type: referenceType === 'transaction' ? 'earned_purchase' : 'earned_bonus',
    points,
    description,
    referenceId,
    referenceType,
    balanceBefore,
    balanceAfter,
    multiplier,
    expiresAt
  });
  
  // Update user balances
  await user.update({
    availablePoints: balanceAfter,
    totalPoints: user.totalPoints + points,
    lifetimePoints: user.lifetimePoints + points,
    lastActivity: new Date()
  });
  
  // Check for ranking upgrade
  await user.updateRanking();
  
  return pointsTransaction;
};

PointsTransaction.createRedeemedTransaction = async function(data) {
  const { userId, businessId, points, description, referenceId, referenceType } = data;
  
  // Get current user balance
  const user = await sequelize.models.User.findByPk(userId);
  if (!user) throw new Error('User not found');
  
  if (user.availablePoints < Math.abs(points)) {
    throw new Error('Insufficient points balance');
  }
  
  const balanceBefore = user.availablePoints;
  const balanceAfter = balanceBefore - Math.abs(points);
  
  // Create points transaction record
  const pointsTransaction = await this.create({
    businessId,
    userId,
    type: referenceType === 'coupon' ? 'redeemed_coupon' : 'redeemed_reward',
    points: -Math.abs(points), // Ensure negative value
    description,
    referenceId,
    referenceType,
    balanceBefore,
    balanceAfter
  });
  
  // Update user balance
  await user.update({
    availablePoints: balanceAfter,
    lastActivity: new Date()
  });
  
  return pointsTransaction;
};

module.exports = PointsTransaction;