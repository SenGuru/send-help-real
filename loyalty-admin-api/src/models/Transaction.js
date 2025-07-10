const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Transaction = sequelize.define('Transaction', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  transactionId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'transaction_id'
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
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount',
    validate: {
      min: 0
    }
  },
  subtotal: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0
    }
  },
  tax: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  discount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  pointsEarned: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'points_earned',
    validate: {
      min: 0
    }
  },
  paymentMethod: {
    type: DataTypes.ENUM('cash', 'credit_card', 'debit_card', 'digital_wallet', 'gift_card', 'other'),
    allowNull: false,
    field: 'payment_method',
    defaultValue: 'credit_card'
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed', 'refunded', 'cancelled'),
    allowNull: false,
    defaultValue: 'pending'
  },
  transactionDate: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'transaction_date',
    defaultValue: DataTypes.NOW
  },
  storeName: {
    type: DataTypes.STRING(255),
    allowNull: true,
    field: 'store_name'
  },
  storeLocation: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'store_location'
  },
  cashierId: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'cashier_id'
  },
  receiptNumber: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'receipt_number'
  },
  items: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: []
  },
  metadata: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {}
  },
  refundedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'refunded_at'
  },
  refundReason: {
    type: DataTypes.TEXT,
    allowNull: true,
    field: 'refund_reason'
  }
}, {
  tableName: 'transactions',
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
      fields: ['status']
    },
    {
      fields: ['transaction_date']
    },
    {
      fields: ['business_id', 'user_id']
    }
  ],
  hooks: {
    beforeCreate: async (transaction) => {
      // Generate transaction ID if not provided
      if (!transaction.transactionId) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        transaction.transactionId = `TXN${timestamp}${random}`;
      }
    }
  }
});

// Instance methods
Transaction.prototype.calculatePoints = function(pointsPerDollar = 2) {
  // Base points calculation: points per dollar spent
  const basePoints = Math.floor(this.totalAmount * pointsPerDollar);
  
  // Apply any multipliers based on user ranking or promotions
  return basePoints;
};

Transaction.prototype.getFormattedAmount = function() {
  return `$${parseFloat(this.totalAmount).toFixed(2)}`;
};

Transaction.prototype.getFormattedDate = function() {
  return this.transactionDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

module.exports = Transaction;