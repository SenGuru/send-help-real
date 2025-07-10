const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'loyalty_admin',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
};

async function runPointTierMigration() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('Connecting to database...');
    const client = await pool.connect();
    
    console.log('Reading point tier migration file...');
    const migrationPath = path.join(__dirname, 'src/migrations/006-create-point-tier-system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running point tier migration...');
    await client.query(migrationSQL);
    
    console.log('Point tier migration completed successfully!');
    
    // Verify tables and data
    console.log('Verifying point tier system...');
    
    const tierTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_name IN ('point_tiers', 'user_point_tiers')
      ORDER BY table_name;
    `);
    
    console.log('Point tier tables created:');
    tierTables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    // Check default tiers
    const defaultTiers = await client.query(`
      SELECT tier_level, name, points_required 
      FROM point_tiers 
      WHERE business_id = (SELECT id FROM business WHERE business_code = 'DEMO1')
      ORDER BY tier_level;
    `);
    
    console.log('\nDefault point tiers created:');
    defaultTiers.rows.forEach(row => {
      console.log(`- Tier ${row.tier_level}: ${row.name} (${row.points_required} points)`);
    });
    
    client.release();
  } catch (error) {
    console.error('Point tier migration failed:', error);
  } finally {
    await pool.end();
  }
}

runPointTierMigration();