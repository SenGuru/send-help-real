const sequelize = require('../config/database');

// Import all models
const Business = require('./Business');
const Ranking = require('./Ranking');
const Coupon = require('./Coupon');
const Theme = require('./Theme');
const User = require('./User'); // Use the new User model
const UserBusiness = require('./UserBusiness'); // New junction table
const Transaction = require('./Transaction');
const PointsTransaction = require('./PointsTransaction');
const Reward = require('./Reward');
const PointTier = require('./PointTier');
const UserPointTier = require('./UserPointTier');
const MenuItem = require('./MenuItem');
const MenuItemPurchase = require('./MenuItemPurchase');

// Define associations

// Business associations
Business.hasMany(Ranking, { foreignKey: 'businessId', as: 'rankings' });
Business.hasMany(Coupon, { foreignKey: 'businessId', as: 'coupons' });
Business.hasMany(Theme, { foreignKey: 'businessId', as: 'themes' });
Business.hasMany(Transaction, { foreignKey: 'businessId', as: 'transactions' });
Business.hasMany(PointsTransaction, { foreignKey: 'businessId', as: 'pointsTransactions' });
Business.hasMany(Reward, { foreignKey: 'businessId', as: 'rewards' });
Business.hasMany(PointTier, { foreignKey: 'businessId', as: 'pointTiers' });
Business.hasMany(UserPointTier, { foreignKey: 'businessId', as: 'userPointTiers' });
Business.hasMany(MenuItem, { foreignKey: 'businessId', as: 'menuItems' });
Business.hasMany(MenuItemPurchase, { foreignKey: 'businessId', as: 'menuPurchases' });
Business.hasMany(UserBusiness, { foreignKey: 'businessId', as: 'members' });

// User and Business many-to-many relationship through UserBusiness
User.belongsToMany(Business, { 
  through: UserBusiness, 
  foreignKey: 'userId', 
  otherKey: 'businessId',
  as: 'businesses' 
});
Business.belongsToMany(User, { 
  through: UserBusiness, 
  foreignKey: 'businessId', 
  otherKey: 'userId',
  as: 'users' 
});

// UserBusiness associations
UserBusiness.belongsTo(User, { foreignKey: 'userId', as: 'user' });
UserBusiness.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
UserBusiness.belongsTo(Ranking, { foreignKey: 'currentRankingId', as: 'currentRanking' });
User.hasMany(UserBusiness, { foreignKey: 'userId', as: 'memberships' });
Business.hasMany(UserBusiness, { foreignKey: 'businessId', as: 'memberships' });

// Ranking associations
Ranking.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Ranking.hasMany(UserBusiness, { foreignKey: 'currentRankingId', as: 'members' });

// Other associations remain the same
Coupon.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });
Theme.belongsTo(Business, { foreignKey: 'businessId', as: 'business' });

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
  UserBusiness,
  Transaction,
  PointsTransaction,
  Reward,
  PointTier,
  UserPointTier,
  MenuItem,
  MenuItemPurchase
};