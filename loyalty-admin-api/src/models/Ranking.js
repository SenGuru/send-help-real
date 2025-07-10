const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Ranking = sequelize.define('Ranking', {
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
  level: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 10
    }
  },
  title: {
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
  benefits: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      discountPercentage: 0,
      specialOffers: [],
      prioritySupport: false,
      freeShipping: false
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
  }
}, {
  tableName: 'rankings',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['business_id', 'level']
    },
    {
      fields: ['business_id']
    },
    {
      fields: ['points_required']
    }
  ]
});

module.exports = Ranking;