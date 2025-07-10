require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const initDatabase = require('./src/config/initDatabase');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Loyalty Admin API is running' });
});

// Public API Routes (for Flutter app)
app.use('/api/public', require('./src/routes/public'));

// User API Routes (for mobile app users)
app.use('/api/users', require('./src/routes/users'));
app.use('/api/points', require('./src/routes/points'));
app.use('/api/transactions', require('./src/routes/transactions'));
app.use('/api/rewards', require('./src/routes/rewards'));

// Admin API Routes (protected)
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/business', require('./src/routes/business'));
app.use('/api/theme', require('./src/routes/theme'));
app.use('/api/rankings', require('./src/routes/rankings'));
app.use('/api/coupons', require('./src/routes/coupons'));
app.use('/api/menu', require('./src/routes/menu'));
app.use('/api/point-tiers', require('./src/routes/pointTiers'));

// Admin-only routes for users and points management  
app.use('/api/admin/users', require('./src/routes/adminUsers'));
app.use('/api/admin/points', require('./src/routes/adminPoints'));

// Superadmin routes
app.use('/api/superadmin/auth', require('./src/routes/superadminAuth'));
app.use('/api/superadmin', require('./src/routes/superadmin'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize database and start server
const startServer = async () => {
  try {
    await initDatabase();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📱 Loyalty Admin API ready`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;