const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
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
  memberId: {
    type: DataTypes.STRING(20),
    allowNull: false,
    unique: true,
    field: 'member_id'
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
  totalPoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'total_points',
    validate: {
      min: 0
    }
  },
  availablePoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'available_points',
    validate: {
      min: 0
    }
  },
  lifetimePoints: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'lifetime_points',
    validate: {
      min: 0
    }
  },
  currentRankingId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'current_ranking_id',
    references: {
      model: 'rankings',
      key: 'id'
    }
  },
  joinDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'join_date'
  },
  lastActivity: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_activity'
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'is_active'
  },
  preferences: {
    type: DataTypes.JSONB,
    allowNull: true,
    defaultValue: {
      emailNotifications: true,
      smsNotifications: true,
      birthdayReminders: true,
      promotionalOffers: true
    }
  },
  profileImageUrl: {
    type: DataTypes.STRING(500),
    allowNull: true,
    field: 'profile_image_url'
  }
}, {
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['business_id', 'email']
    },
    {
      fields: ['business_id']
    },
    {
      fields: ['member_id']
    },
    {
      fields: ['total_points']
    },
    {
      fields: ['current_ranking_id']
    }
  ],
  hooks: {
    beforeCreate: async (user) => {
      // Hash password before saving
      if (user.password) {
        const saltRounds = 12;
        user.password = await bcrypt.hash(user.password, saltRounds);
      }
      
      // Generate member ID if not provided (fallback only)
      if (!user.memberId) {
        user.memberId = `USER${Date.now()}`;
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

User.prototype.getCurrentRanking = async function() {
  if (this.currentRankingId) {
    return await sequelize.models.Ranking.findByPk(this.currentRankingId);
  }
  return null;
};

User.prototype.getNextRanking = async function() {
  const rankings = await sequelize.models.Ranking.findAll({
    where: { businessId: this.businessId },
    order: [['pointsRequired', 'ASC']]
  });
  
  return rankings.find(ranking => ranking.pointsRequired > this.totalPoints);
};

User.prototype.updateRanking = async function() {
  const rankings = await sequelize.models.Ranking.findAll({
    where: { businessId: this.businessId },
    order: [['pointsRequired', 'DESC']]
  });
  
  const eligibleRanking = rankings.find(ranking => this.totalPoints >= ranking.pointsRequired);
  
  if (eligibleRanking && (!this.currentRankingId || eligibleRanking.id !== this.currentRankingId)) {
    this.currentRankingId = eligibleRanking.id;
    await this.save();
    return eligibleRanking;
  }
  
  return null;
};

module.exports = User;