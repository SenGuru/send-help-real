const sequelize = require('../config/database');

// Import all models
const Business = require('./Business');
const Ranking = require('./Ranking');
const Coupon = require('./Coupon');
const Theme = require('./Theme');
const User = require('./User');
const Transaction = require('./Transaction');
const PointsTransaction = require('./PointsTransaction');
const Reward = require('./Reward');
const PointTier = require('./PointTier');
const UserPointTier = require('./UserPointTier');
const MenuItem = require('./MenuItem');
const MenuItemPurchase = require('./MenuItemPurchase');

// Define associations
Business.hasMany(Ranking, { foreignKey: 'businessId', as: 'rankings' });
Business.hasMany(Coupon, { foreignKey: 'businessId', as: 'coupons' });
Business.hasMany(Theme, { foreignKey: 'businessId', as: 'themes' });
Business.hasMany(User, { foreignKey: 'businessId', as: 'users' });
Business.hasMany(Transaction, { foreignKey: 'businessId', as: 'transactions' });
Business.hasMany(PointsTransaction, { foreignKey: 'businessId', as: 'pointsTransactions' });
Business.hasMany(Reward, { foreignKey: 'businessId', as: 'rewards' });
Business.hasMany(PointTier, { foreignKey: 'businessId', as: 'pointTiers' });
Business.hasMany(UserPointTier, { foreignKey: 'businessId', as: 'userPointTiers' });
Business.hasMany(MenuItem, { foreignKey: 'businessId', as: 'menuItems' });
Business.hasMany(MenuItemPurchase, { foreignKey: 'businessId', as: 'menuPurchases' });

Ranking.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Ranking.hasMany(User, { foreignKey: 'currentRankingId', as: 'users' });

Coupon.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

Theme.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

User.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
User.belongsTo(Ranking, { foreignKey: 'currentRankingId', as: 'currentRanking' });
User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
User.hasMany(PointsTransaction, { foreignKey: 'userId', as: 'pointsTransactions' });
User.hasOne(UserPointTier, { foreignKey: 'userId', as: 'pointTier' });

PointTier.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
PointTier.hasMany(UserPointTier, { foreignKey: 'currentTierId', as: 'users' });

UserPointTier.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
UserPointTier.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserPointTier.belongsTo(PointTier, { foreignKey: 'currentTierId', as: 'currentTier' });

MenuItem.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
MenuItem.hasMany(MenuItemPurchase, { foreignKey: 'menuItemId', as: 'purchases' });

MenuItemPurchase.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
MenuItemPurchase.belongsTo(User, { foreignKey: 'userId', as: 'user' });
MenuItemPurchase.belongsTo(MenuItem, { foreignKey: 'menuItemId', as: 'menuItem' });

Transaction.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Transaction.hasMany(PointsTransaction, { foreignKey: 'transactionId', as: 'pointsTransactions' });

PointsTransaction.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
PointsTransaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
PointsTransaction.belongsTo(Transaction, { foreignKey: 'transactionId', as: 'transaction' });

Reward.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

module.exports = {
  sequelize,
  Business,
  Ranking,
  Coupon,
  Theme,
  User,
  Transaction,
  PointsTransaction,
  Reward,
  PointTier,
  UserPointTier,
  MenuItem,
  MenuItemPurchase
};