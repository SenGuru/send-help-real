const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const UserBusiness = sequelize.define('UserBusiness', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
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
    field: 'member_id'
  },
  joinDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
    field: 'join_date'
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
  qrCodeData: {
    type: DataTypes.JSONB,
    allowNull: true,
    field: 'qr_code_data',
    comment: 'Stores QR code information containing appUserId, businessUserId, businessCode, and joinDate'
  }
}, {
  tableName: 'user_businesses',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'business_id']
    },
    {
      unique: true,
      fields: ['business_id', 'member_id']
    },
    {
      fields: ['user_id']
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
    beforeCreate: async (userBusiness) => {
      console.log('UserBusiness beforeCreate hook triggered');
      
      // Generate random alphanumeric business user ID if not provided
      if (!userBusiness.memberId) {
        try {
          console.log('Generating business user ID for business:', userBusiness.businessId);
          
          // Generate random alphanumeric ID (8 characters)
          const generateRandomId = () => {
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
            let result = '';
            for (let i = 0; i < 8; i++) {
              result += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            return result;
          };
          
          // Ensure uniqueness within the business
          let isUnique = false;
          let attempts = 0;
          const maxAttempts = 10;
          
          while (!isUnique && attempts < maxAttempts) {
            const candidateId = generateRandomId();
            
            // Check if this ID already exists for this business
            const [existingResult] = await sequelize.query(
              'SELECT COUNT(*) as count FROM user_businesses WHERE business_id = ? AND member_id = ?',
              { 
                replacements: [userBusiness.businessId, candidateId],
                type: sequelize.QueryTypes.SELECT 
              }
            );
            
            if (existingResult.count === 0) {
              userBusiness.memberId = candidateId;
              isUnique = true;
              console.log('Generated business user ID:', userBusiness.memberId);
            }
            attempts++;
          }
          
          // Fallback if we couldn't generate unique ID
          if (!isUnique) {
            userBusiness.memberId = `USR${Date.now()}`;
            console.log('Fallback business user ID:', userBusiness.memberId);
          }
        } catch (error) {
          console.error('Error generating business user ID:', error);
          userBusiness.memberId = `USR${Date.now()}`;
        }
      }
      
      // Generate QR code data
      try {
        console.log('Generating QR code data for user:', userBusiness.userId);
        
        // Get business code
        const [businessResult] = await sequelize.query(
          'SELECT business_code FROM business WHERE id = ?',
          { 
            replacements: [userBusiness.businessId],
            type: sequelize.QueryTypes.SELECT 
          }
        );
        
        const businessCode = businessResult?.business_code || 'UNKNOWN';
        
        // Create QR code data object
        userBusiness.qrCodeData = {
          appUserId: userBusiness.userId,
          businessUserId: userBusiness.memberId,
          businessCode: businessCode,
          joinDate: userBusiness.joinDate || new Date().toISOString(),
          generatedAt: new Date().toISOString()
        };
        
        console.log('Generated QR code data:', userBusiness.qrCodeData);
      } catch (error) {
        console.error('Error generating QR code data:', error);
        // Set minimal QR code data as fallback
        userBusiness.qrCodeData = {
          appUserId: userBusiness.userId,
          businessUserId: userBusiness.memberId,
          businessCode: 'UNKNOWN',
          joinDate: new Date().toISOString(),
          generatedAt: new Date().toISOString()
        };
      }
    }
  }
});

module.exports = UserBusiness;