const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name',
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name',
    validate: {
      notEmpty: true,
      len: [1, 100]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      len: [8, 255]
    }
  },
  phoneNumber: {
    type: DataTypes.STRING(20),
    allowNull: true,
    field: 'phone_number'
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'date_of_birth'
  },
  profileImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image_url'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['phone_number']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      // Hash password before saving
      if (user.password) {
        const saltRounds = 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    },
    beforeUpdate: async (user) => {
      // Hash password if it's being updated
      if (user.changed('password')) {
        const saltRounds = 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
    }
  }
});

// Instance methods
User.prototype.validatePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

User.prototype.getFullName = function() {
  return `${this.firstName} ${this.lastName}`;
};

// Get user's membership for a specific business
User.prototype.getBusinessMembership = async function(businessId) {
  const UserBusiness = sequelize.models.UserBusiness;
  return await UserBusiness.findOne({
    where: {
      userId: this.id,
      businessId: businessId
    },
    include: [{
      model: sequelize.models.Ranking,
      as: 'currentRanking'
    }]
  });
};

// Get all businesses this user is a member of
User.prototype.getBusinessMemberships = async function() {
  const UserBusiness = sequelize.models.UserBusiness;
  return await UserBusiness.findAll({
    where: {
      userId: this.id
    },
    include: [{
      model: sequelize.models.Business,
      as: 'business'
    }, {
      model: sequelize.models.Ranking,
      as: 'currentRanking'
    }]
  });
};

module.exports = User;