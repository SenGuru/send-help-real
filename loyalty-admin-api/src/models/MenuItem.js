const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItem = sequelize.define('MenuItem', {
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
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 200]
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  pointsEarned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'points_earned',
    validate: {
      min: 0
    }
  },
  imageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'image_url'
  },
  isAvailable: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_available'
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
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {},
    validate: {
      isValidMetadata(value) {
        if (value && typeof value !== 'object') {
          throw new Error('Metadata must be an object');
        }
      }
    }
  }
}, {
  tableName: 'menu_items',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      fields: ['business_id']
    },
    {
      fields: ['category']
    },
    {
      fields: ['is_available']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['sort_order']
    },
    {
      fields: ['business_id', 'category']
    }
  ]
});

// Instance methods
MenuItem.prototype.getFormattedPrice = function() {
  return `$${this.price.toFixed(2)}`;
};

MenuItem.prototype.getFormattedPoints = function() {
  return `${this.pointsEarned} pts`;
};

MenuItem.prototype.getPointsPerDollar = function() {
  if (this.price === 0) return 0;
  return (this.pointsEarned / parseFloat(this.price)).toFixed(2);
};

// Static methods
MenuItem.getByCategory = async function(businessId, category) {
  return await this.findAll({
    where: { 
      businessId,
      category,
      isActive: true
    },
    order: [['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

MenuItem.getBusinessMenu = async function(businessId, includeInactive = false) {
  const whereClause = { businessId };
  if (!includeInactive) {
    whereClause.isActive = true;
  }

  return await this.findAll({
    where: whereClause,
    order: [['category', 'ASC'], ['sortOrder', 'ASC'], ['name', 'ASC']]
  });
};

MenuItem.getCategories = async function(businessId) {
  const result = await this.findAll({
    where: { 
      businessId,
      isActive: true
    },
    attributes: [
      'category',
      [sequelize.fn('COUNT', '*'), 'itemCount'],
      [sequelize.fn('SUM', sequelize.col('points_earned')), 'totalPoints'],
      [sequelize.fn('AVG', sequelize.col('price')), 'avgPrice']
    ],
    group: ['category'],
    order: [['category', 'ASC']]
  });

  return result.map(item => ({
    category: item.category,
    itemCount: parseInt(item.dataValues.itemCount),
    totalPoints: parseInt(item.dataValues.totalPoints) || 0,
    avgPrice: parseFloat(item.dataValues.avgPrice) || 0
  }));
};

module.exports = MenuItem;