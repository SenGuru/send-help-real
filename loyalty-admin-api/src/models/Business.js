const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Business = sequelize.define('Business', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 255]
    }
  },
  businessCode: {
    type: DataTypes.STRING(5),
    allowNull: false,
    unique: true,
    field: 'business_code',
    validate: {
      notEmpty: true,
      len: [5, 5],
      isAlphanumeric: true,
      isUppercase: true
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  logoUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'logo_url'
  },
  contactEmail: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'contact_email',
    validate: {
      isEmail: true
    }
  },
  contactPhone: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'contact_phone'
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  operatingHours: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'operating_hours',
    defaultValue: {
      monday: { open: '09:00', close: '17:00', closed: false },
      tuesday: { open: '09:00', close: '17:00', closed: false },
      wednesday: { open: '09:00', close: '17:00', closed: false },
      thursday: { open: '09:00', close: '17:00', closed: false },
      friday: { open: '09:00', close: '17:00', closed: false },
      saturday: { open: '09:00', close: '17:00', closed: false },
      sunday: { open: '09:00', close: '17:00', closed: true }
    }
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  website: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: {
      isUrl: true
    }
  },
  established: {
    type: DataTypes.STRING(4),
    allowNull: true
  },
  memberSince: {
    type: DataTypes.STRING(4),
    allowNull: true,
    field: 'member_since'
  },
  totalMembers: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 0,
    field: 'total_members'
  },
  features: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  socialMedia: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'social_media',
    defaultValue: {
      instagram: '',
      facebook: '',
      twitter: ''
    }
  },
  loyaltyBenefits: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'loyalty_benefits',
    defaultValue: []
  }
}, {
  tableName: 'business',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Business;