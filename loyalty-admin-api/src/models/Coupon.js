const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Coupon = sequelize.define('Coupon', {
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
    allowNull: true
  },
  code: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: true,
      len: [3, 50],
      isAlphanumeric: true
    }
  },
  discountType: {
    type: DataTypes.ENUM('percentage', 'fixed', 'points'),
    allowNull: false,
    field: 'discount_type'
  },
  discountValue: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'discount_value',
    validate: {
      min: 0
    }
  },
  minimumPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'minimum_purchase',
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  expirationDate: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'expiration_date',
    validate: {
      isAfterToday(value) {
        if (value && value <= new Date()) {
          throw new Error('Expiration date must be in the future');
        }
      }
    }
  },
  usageLimit: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'usage_limit',
    validate: {
      min: 1
    }
  },
  usedCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'used_count',
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    field: 'is_active',
    defaultValue: true
  },
  targetRankingLevel: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'target_ranking_level',
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'coupons',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['business_id', 'code']
    },
    {
      fields: ['business_id']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['expiration_date']
    }
  ]
});

module.exports = Coupon;