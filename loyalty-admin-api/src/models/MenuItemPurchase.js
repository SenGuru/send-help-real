const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MenuItemPurchase = sequelize.define('MenuItemPurchase', {
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
  menuItemId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'menu_item_id',
    references: {
      model: 'menu_items',
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1,
    validate: {
      min: 1
    }
  },
  priceAtPurchase: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'price_at_purchase',
    validate: {
      min: 0
    }
  },
  pointsEarnedAtPurchase: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'points_earned_at_purchase',
    validate: {
      min: 0
    }
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
    validate: {
      min: 0
    }
  },
  totalPointsEarned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'total_points_earned',
    validate: {
      min: 0
    }
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'cancelled', 'refunded'),
    allowNull: false,
    defaultValue: 'completed'
  },
  paymentMethod: {
    type: DataTypes.STRING(50),
    allowNull: true,
    field: 'payment_method'
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  purchaseDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'purchase_date'
  }
}, {
  tableName: 'menu_item_purchases',
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
      fields: ['menu_item_id']
    },
    {
      fields: ['status']
    },
    {
      fields: ['purchase_date']
    },
    {
      fields: ['business_id', 'user_id']
    },
    {
      fields: ['business_id', 'purchase_date']
    }
  ]
});

// Instance methods
MenuItemPurchase.prototype.getFormattedTotal = function() {
  return `$${this.totalAmount.toFixed(2)}`;
};

MenuItemPurchase.prototype.getFormattedPoints = function() {
  return `${this.totalPointsEarned} pts`;
};

MenuItemPurchase.prototype.getFormattedDate = function() {
  return this.purchaseDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Static methods
MenuItemPurchase.createPurchase = async function(data) {
  const { businessId, userId, menuItemId, quantity = 1, paymentMethod, notes } = data;
  
  // Get menu item details
  const MenuItem = sequelize.models.MenuItem;
  const menuItem = await MenuItem.findByPk(menuItemId);
  
  if (!menuItem) {
    throw new Error('Menu item not found');
  }
  
  if (!menuItem.isAvailable || !menuItem.isActive) {
    throw new Error('Menu item is not available');
  }
  
  // Calculate totals
  const priceAtPurchase = parseFloat(menuItem.price);
  const pointsEarnedAtPurchase = menuItem.pointsEarned;
  const totalAmount = priceAtPurchase * quantity;
  const totalPointsEarned = pointsEarnedAtPurchase * quantity;
  
  // Create purchase record
  const purchase = await this.create({
    businessId,
    userId,
    menuItemId,
    quantity,
    priceAtPurchase,
    pointsEarnedAtPurchase,
    totalAmount,
    totalPointsEarned,
    paymentMethod,
    notes,
    status: 'completed'
  });
  
  // Award points to user (this would integrate with existing points system)
  const PointsTransaction = sequelize.models.PointsTransaction;
  if (PointsTransaction) {
    await PointsTransaction.createEarnedTransaction({
      businessId,
      userId,
      points: totalPointsEarned,
      description: `Points earned from ${menuItem.name} purchase`,
      referenceId: purchase.id.toString(),
      referenceType: 'menu_purchase'
    });
  }
  
  return purchase;
};

MenuItemPurchase.getUserPurchases = async function(businessId, userId, limit = 50) {
  return await this.findAll({
    where: { businessId, userId },
    include: [{
      model: sequelize.models.MenuItem,
      as: 'menuItem',
      attributes: ['name', 'category', 'imageUrl']
    }],
    order: [['purchaseDate', 'DESC']],
    limit
  });
};

MenuItemPurchase.getBusinessStats = async function(businessId, startDate, endDate) {
  const whereClause = { businessId };
  
  if (startDate && endDate) {
    whereClause.purchaseDate = {
      [sequelize.Sequelize.Op.between]: [startDate, endDate]
    };
  }
  
  const stats = await this.findAll({
    where: whereClause,
    attributes: [
      [sequelize.fn('COUNT', '*'), 'totalPurchases'],
      [sequelize.fn('SUM', sequelize.col('total_amount')), 'totalRevenue'],
      [sequelize.fn('SUM', sequelize.col('total_points_earned')), 'totalPointsAwarded'],
      [sequelize.fn('AVG', sequelize.col('total_amount')), 'avgPurchaseAmount']
    ]
  });
  
  return stats[0] ? {
    totalPurchases: parseInt(stats[0].dataValues.totalPurchases) || 0,
    totalRevenue: parseFloat(stats[0].dataValues.totalRevenue) || 0,
    totalPointsAwarded: parseInt(stats[0].dataValues.totalPointsAwarded) || 0,
    averageOrderValue: parseFloat(stats[0].dataValues.avgPurchaseAmount) || 0
  } : {
    totalPurchases: 0,
    totalRevenue: 0,
    totalPointsAwarded: 0,
    averageOrderValue: 0
  };
};

module.exports = MenuItemPurchase;