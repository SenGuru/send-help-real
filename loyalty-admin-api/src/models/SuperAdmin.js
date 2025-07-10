const { DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/database');

const SuperAdmin = sequelize.define('SuperAdmin', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    allowNull: false
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    field: 'last_name'
  },
  role: {
    type: DataTypes.STRING(50),
    allowNull: false,
    defaultValue: 'superadmin'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    field: 'last_login'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    field: 'updated_at'
  }
}, {
  tableName: 'superadmins',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// Hash password before creating/updating
SuperAdmin.beforeCreate(async (superadmin) => {
  if (superadmin.password) {
    const salt = await bcrypt.genSalt(10);
    superadmin.password = await bcrypt.hash(superadmin.password, salt);
  }
});

SuperAdmin.beforeUpdate(async (superadmin) => {
  if (superadmin.changed('password')) {
    const salt = await bcrypt.genSalt(10);
    superadmin.password = await bcrypt.hash(superadmin.password, salt);
  }
});

// Instance method to check password
SuperAdmin.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

// Instance method to get safe user data
SuperAdmin.prototype.getSafeData = function() {
  return {
    id: this.id,
    email: this.email,
    name: `${this.firstName} ${this.lastName}`,
    firstName: this.firstName,
    lastName: this.lastName,
    role: this.role,
    isActive: this.isActive,
    lastLogin: this.lastLogin,
    createdAt: this.createdAt
  };
};

module.exports = SuperAdmin;