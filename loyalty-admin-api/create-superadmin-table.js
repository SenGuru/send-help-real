const sequelize = require('./src/config/database');

const createSuperAdminTable = async () => {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS superadmins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(50) NOT NULL DEFAULT 'superadmin',
        is_active BOOLEAN DEFAULT TRUE,
        last_login DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ SuperAdmin table created successfully');
    
    // Create a default superadmin user if none exists
    const [results] = await sequelize.query('SELECT COUNT(*) as count FROM superadmins');
    const count = results[0].count;
    
    if (count === 0) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('superadmin123', 10);
      
      await sequelize.query(`
        INSERT INTO superadmins (email, password, first_name, last_name, role, created_at, updated_at) 
        VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `, {
        replacements: ['superadmin@loyalty.com', hashedPassword, 'Super', 'Admin', 'superadmin']
      });
      
      console.log('✅ Default SuperAdmin user created:');
      console.log('   Email: superadmin@loyalty.com');
      console.log('   Password: superadmin123');
    }
    
  } catch (error) {
    console.error('❌ Error creating SuperAdmin table:', error);
  } finally {
    await sequelize.close();
  }
};

createSuperAdminTable();