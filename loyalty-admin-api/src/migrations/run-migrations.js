const fs = require('fs');
const path = require('path');
const sequelize = require('../config/database');

async function runMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Get all migration files
    const migrationsDir = __dirname;
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort();
    
    console.log(`Found ${migrationFiles.length} migration files`);
    
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      
      const sqlContent = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
      
      // Split the SQL content by semicolons and execute each statement
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0);
      
      for (const statement of statements) {
        try {
          await sequelize.query(statement);
        } catch (error) {
          console.error(`Error executing statement in ${file}:`, statement);
          throw error;
        }
      }
      
      console.log(`✓ Migration ${file} completed successfully`);
    }
    
    console.log('All migrations completed successfully!');
    
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

// Function to create sample data
async function createSampleData() {
  try {
    console.log('Creating sample data...');
    
    // Import models
    const { Business, User, Ranking, Transaction, PointsTransaction, Reward } = require('../models');
    
    // Get existing business
    const business = await Business.findOne();
    if (!business) {
      console.log('No business found. Please create a business first.');
      return;
    }
    
    console.log(`Using business: ${business.name} (${business.businessCode})`);
    
    // Create sample rankings if they don't exist
    const existingRankings = await Ranking.findAll({ where: { businessId: business.id } });
    if (existingRankings.length === 0) {
      console.log('Creating sample rankings...');
      
      await Ranking.bulkCreate([
        {
          businessId: business.id,
          level: 1,
          title: 'Bronze',
          pointsRequired: 0,
          benefits: {
            discountPercentage: 5,
            specialOffers: ['Welcome bonus'],
            prioritySupport: false,
            freeShipping: false
          },
          color: '#CD7F32'
        },
        {
          businessId: business.id,
          level: 2,
          title: 'Silver',
          pointsRequired: 1000,
          benefits: {
            discountPercentage: 10,
            specialOffers: ['Birthday discount', 'Member-only sales'],
            prioritySupport: false,
            freeShipping: false
          },
          color: '#C0C0C0'
        },
        {
          businessId: business.id,
          level: 3,
          title: 'Gold',
          pointsRequired: 3000,
          benefits: {
            discountPercentage: 15,
            specialOffers: ['Early access', 'Exclusive products', 'Birthday discount'],
            prioritySupport: true,
            freeShipping: true
          },
          color: '#FFD700'
        },
        {
          businessId: business.id,
          level: 4,
          title: 'Platinum',
          pointsRequired: 5000,
          benefits: {
            discountPercentage: 20,
            specialOffers: ['VIP events', 'Personal shopping', 'Exclusive products'],
            prioritySupport: true,
            freeShipping: true
          },
          color: '#E5E4E2'
        }
      ]);
      
      console.log('✓ Sample rankings created');
    }
    
    // Create sample rewards
    const existingRewards = await Reward.findAll({ where: { businessId: business.id } });
    if (existingRewards.length === 0) {
      console.log('Creating sample rewards...');
      
      await Reward.bulkCreate([
        {
          businessId: business.id,
          title: 'Free Coffee',
          description: 'Enjoy a complimentary coffee of your choice',
          pointsCost: 500,
          type: 'free_item',
          value: 4.50,
          termsAndConditions: 'Valid for one free coffee. Cannot be combined with other offers.',
          isFeatured: true,
          sortOrder: 1
        },
        {
          businessId: business.id,
          title: '10% Off Next Purchase',
          description: 'Get 10% discount on your next purchase',
          pointsCost: 750,
          type: 'discount_percentage',
          value: 10,
          termsAndConditions: 'Valid for one-time use. Minimum purchase $25.',
          sortOrder: 2
        },
        {
          businessId: business.id,
          title: 'Free Shipping',
          description: 'Free shipping on your next online order',
          pointsCost: 300,
          type: 'free_shipping',
          termsAndConditions: 'Valid for online orders only. No minimum purchase required.',
          sortOrder: 3
        },
        {
          businessId: business.id,
          title: '$5 Off Purchase',
          description: 'Get $5 off your next purchase of $30 or more',
          pointsCost: 1000,
          type: 'discount_amount',
          value: 5,
          termsAndConditions: 'Minimum purchase $30. Cannot be combined with other discounts.',
          sortOrder: 4
        },
        {
          businessId: business.id,
          title: 'VIP Experience',
          description: 'Exclusive VIP shopping experience with personal assistance',
          pointsCost: 2500,
          type: 'experience',
          minimumRankingLevel: 3,
          termsAndConditions: 'Available for Gold members and above. Appointment required.',
          sortOrder: 5
        }
      ]);
      
      console.log('✓ Sample rewards created');
    }
    
    // Create sample users
    const existingUsers = await User.findAll({ where: { businessId: business.id } });
    if (existingUsers.length === 0) {
      console.log('Creating sample users...');
      
      const bronzeRanking = await Ranking.findOne({ 
        where: { businessId: business.id, level: 1 } 
      });
      const silverRanking = await Ranking.findOne({ 
        where: { businessId: business.id, level: 2 } 
      });
      const goldRanking = await Ranking.findOne({ 
        where: { businessId: business.id, level: 3 } 
      });
      
      const users = await User.bulkCreate([
        {
          businessId: business.id,
          memberId: `${business.businessCode}000001`,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@email.com',
          password: 'password123',
          phoneNumber: '+1-555-123-4567',
          totalPoints: 2450,
          availablePoints: 2450,
          lifetimePoints: 2450,
          currentRankingId: goldRanking ? goldRanking.id : null,
          joinDate: new Date('2023-01-15')
        },
        {
          businessId: business.id,
          memberId: `${business.businessCode}000002`,
          firstName: 'Jane',
          lastName: 'Smith',
          email: 'jane.smith@email.com',
          password: 'password123',
          phoneNumber: '+1-555-234-5678',
          totalPoints: 1250,
          availablePoints: 1250,
          lifetimePoints: 1250,
          currentRankingId: silverRanking ? silverRanking.id : null,
          joinDate: new Date('2023-03-20')
        },
        {
          businessId: business.id,
          memberId: `${business.businessCode}000003`,
          firstName: 'Mike',
          lastName: 'Johnson',
          email: 'mike.johnson@email.com',
          password: 'password123',
          phoneNumber: '+1-555-345-6789',
          totalPoints: 750,
          availablePoints: 750,
          lifetimePoints: 750,
          currentRankingId: bronzeRanking ? bronzeRanking.id : null,
          joinDate: new Date('2023-06-10')
        }
      ]);
      
      console.log('✓ Sample users created');
      
      // Create sample transactions and points
      console.log('Creating sample transactions...');
      
      for (const user of users) {
        // Create a few sample transactions
        const transaction1 = await Transaction.create({
          businessId: business.id,
          userId: user.id,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          totalAmount: 45.99,
          subtotal: 41.81,
          tax: 4.18,
          pointsEarned: 92,
          paymentMethod: 'credit_card',
          status: 'completed',
          storeName: 'Main Street Store',
          storeLocation: '123 Main St, City, State',
          items: [
            { name: 'Coffee', price: 4.50, quantity: 1 },
            { name: 'Pastry', price: 3.25, quantity: 1 },
            { name: 'Sandwich', price: 8.95, quantity: 1 }
          ]
        });
        
        // Create corresponding points transaction
        await PointsTransaction.create({
          businessId: business.id,
          userId: user.id,
          transactionId: transaction1.id,
          type: 'earned_purchase',
          points: 92,
          description: `Purchase at ${transaction1.storeName}`,
          referenceId: transaction1.transactionId,
          referenceType: 'transaction',
          balanceBefore: 0,
          balanceAfter: 92,
          multiplier: 2.0
        });
        
        const transaction2 = await Transaction.create({
          businessId: business.id,
          userId: user.id,
          transactionId: `TXN-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          totalAmount: 89.50,
          subtotal: 81.36,
          tax: 8.14,
          pointsEarned: 179,
          paymentMethod: 'digital_wallet',
          status: 'completed',
          storeName: 'Downtown Outlet',
          items: [
            { name: 'Shirt', price: 29.99, quantity: 2 },
            { name: 'Accessory', price: 15.95, quantity: 1 }
          ]
        });
        
        await PointsTransaction.create({
          businessId: business.id,
          userId: user.id,
          transactionId: transaction2.id,
          type: 'earned_purchase',
          points: 179,
          description: `Purchase at ${transaction2.storeName}`,
          referenceId: transaction2.transactionId,
          referenceType: 'transaction',
          balanceBefore: 92,
          balanceAfter: 271,
          multiplier: 2.0
        });
        
        // Add birthday bonus for some users
        if (user.firstName === 'John') {
          await PointsTransaction.create({
            businessId: business.id,
            userId: user.id,
            type: 'earned_bonus',
            points: 500,
            description: 'Birthday bonus points',
            referenceType: 'birthday',
            balanceBefore: 271,
            balanceAfter: 771,
            multiplier: 1.0
          });
        }
      }
      
      console.log('✓ Sample transactions and points created');
    }
    
    console.log('Sample data creation completed!');
    
  } catch (error) {
    console.error('Sample data creation failed:', error);
    throw error;
  }
}

// Main function
async function main() {
  try {
    await sequelize.authenticate();
    console.log('Database connection established.');
    
    await runMigrations();
    await createSampleData();
    
    console.log('Setup completed successfully!');
    
  } catch (error) {
    console.error('Setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { runMigrations, createSampleData };