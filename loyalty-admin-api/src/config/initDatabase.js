require('dotenv').config();
const sequelize = require('./database');
const Admin = require('../models/Admin');
const Business = require('../models/Business');
const Theme = require('../models/Theme');
const Ranking = require('../models/Ranking');
const Coupon = require('../models/Coupon');
const SuperAdmin = require('../models/SuperAdmin');
const config = require('./config');

const initDatabase = async () => {
  try {
    console.log('🔄 Initializing database...');
    
    // Test database connection
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync all models (create tables) - only create if they don't exist
    await sequelize.sync({ force: false });
    console.log('✅ Database tables synchronized.');

    // Check if initial admin exists
    const adminCount = await Admin.count();
    
    // Create default business if none exists
    let defaultBusiness = await Business.findOne();
    if (!defaultBusiness) {
      defaultBusiness = await Business.create({
        name: 'Demo Business',
        description: 'This is a demo business for testing. Change this in the admin panel.',
        contactEmail: config.adminEmail,
        contactPhone: '+1 (555) 123-4567',
        address: '123 Demo St, Demo City, DC 12345',
        businessCode: 'DEMO1'
      });
      console.log('✅ Default business created with code: DEMO1');
    }
    
    if (adminCount === 0 && config.adminEmail && config.adminPassword) {

      // Create admin linked to business
      await Admin.create({
        email: config.adminEmail,
        password: config.adminPassword,
        firstName: 'Admin',
        lastName: 'User',
        businessId: defaultBusiness.id
      });
      console.log('✅ Initial admin and business created.');
    }

    // Get first business for creating default data
    const firstBusiness = await Business.findOne();
    if (!firstBusiness) {
      console.log('⚠️  No business found for creating default data');
      return;
    }
    const businessId = firstBusiness.id;

    // Create default theme if none exists for this business
    const themeCount = await Theme.count({ where: { businessId } });
    if (themeCount === 0) {
      await Theme.create({
        businessId,
        name: 'Default Sage Theme',
        colors: {
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
        },
        isActive: true
      });
      console.log('✅ Default theme created.');
    }

    // Create default rankings if none exist for this business
    const rankingCount = await Ranking.count({ where: { businessId } });
    if (rankingCount === 0) {
      const defaultRankings = [
        {
          businessId,
          level: 1,
          title: 'Bronze Explorer',
          pointsRequired: 0,
          color: '#CD7F32',
          benefits: {
            discountPercentage: 5,
            specialOffers: ['Welcome bonus'],
            prioritySupport: false,
            freeShipping: false
          }
        },
        {
          businessId,
          level: 2,
          title: 'Silver Adventurer',
          pointsRequired: 500,
          color: '#C0C0C0',
          benefits: {
            discountPercentage: 10,
            specialOffers: ['Monthly deals', 'Birthday bonus'],
            prioritySupport: false,
            freeShipping: false
          }
        },
        {
          businessId,
          level: 3,
          title: 'Gold Champion',
          pointsRequired: 1000,
          color: '#FFD700',
          benefits: {
            discountPercentage: 15,
            specialOffers: ['Exclusive events', 'Early access', 'VIP deals'],
            prioritySupport: true,
            freeShipping: true
          }
        }
      ];

      await Ranking.bulkCreate(defaultRankings);
      console.log('✅ Default rankings created.');
    }

    // Create sample coupons if none exist for this business
    const couponCount = await Coupon.count({ where: { businessId } });
    if (couponCount === 0) {
      const sampleCoupons = [
        {
          businessId,
          title: 'Welcome Bonus',
          description: 'Get 10% off your first purchase',
          code: 'WELCOME10',
          discountType: 'percentage',
          discountValue: 10.00,
          minimumPurchase: 0,
          usageLimit: 100,
          isActive: true
        },
        {
          businessId,
          title: 'Summer Sale',
          description: '$5 off orders over $50',
          code: 'SUMMER5',
          discountType: 'fixed',
          discountValue: 5.00,
          minimumPurchase: 50.00,
          expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          usageLimit: 50,
          isActive: true
        }
      ];

      await Coupon.bulkCreate(sampleCoupons);
      console.log('✅ Sample coupons created.');
    }

    // Create SuperAdmin user if none exists
    const superAdminCount = await SuperAdmin.count();
    if (superAdminCount === 0) {
      await SuperAdmin.create({
        email: 'superadmin@loyalty.com',
        password: 'superadmin123', // This will be hashed by the model
        firstName: 'Super',
        lastName: 'Admin',
        role: 'superadmin',
        isActive: true
      });
      console.log('✅ SuperAdmin user created.');
      console.log('\n📝 SuperAdmin Login Details:');
      console.log('Email: superadmin@loyalty.com');
      console.log('Password: superadmin123');
      console.log('\n⚠️  Please change the superadmin password after first login!');
    }

    console.log('🎉 Database initialization completed successfully!');
    
    if (adminCount === 0) {
      console.log('\n📝 Admin Login Details:');
      console.log(`Email: ${config.adminEmail}`);
      console.log(`Password: ${config.adminPassword}`);
      console.log('\n⚠️  Please change the admin password after first login!');
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
};

// Run initialization if this file is executed directly
if (require.main === module) {
  initDatabase()
    .then(() => {
      console.log('Database initialization completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Database initialization failed:', error);
      process.exit(1);
    });
}

module.exports = initDatabase;