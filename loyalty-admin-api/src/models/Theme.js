const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Theme = sequelize.define('Theme', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  colors: {
    type: DataTypes.JSONB,
    allowNull: false,
    validate: {
      isValidColors(value) {
        const requiredColors = ['primary', 'secondary', 'accent', 'background', 'text'];
        const hasAllRequired = requiredColors.every(color => value[color]);
        if (!hasAllRequired) {
          throw new Error('Theme must include all required colors: primary, secondary, accent, background, text');
        }
      }
    },
    defaultValue: {
      primary: '#9CAF88',
      secondary: '#F5F5DC',
      accent: '#7A8B6B',
      background: '#FAFAF0',
      text: '#333333',
      lightGray: '#E0E0E0',
      darkGray: '#666666',
      success: '#388E3C',
      warning: '#F57C00',
      error: '#D32F2F',
      info: '#1976D2'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_active'
  }
}, {
  tableName: 'themes',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

module.exports = Theme;