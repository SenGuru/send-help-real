require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

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
  res.json({ 
    status: 'OK', 
    message: 'Loyalty Admin API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Test routes (without database)
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API endpoints are working',
    endpoints: {
      auth: '/api/auth/*',
      business: '/api/business/*',
      theme: '/api/theme/*',
      rankings: '/api/rankings/*',
      coupons: '/api/coupons/*'
    }
  });
});

// API Routes (these will work when database is connected)
app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/business', require('./src/routes/business'));
app.use('/api/theme', require('./src/routes/theme'));
app.use('/api/rankings', require('./src/routes/rankings'));
app.use('/api/coupons', require('./src/routes/coupons'));

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

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Loyalty Admin API ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(`🧪 Test endpoints: http://localhost:${PORT}/api/test`);
  console.log('\n⚠️  Database not connected - configure PostgreSQL to enable full functionality');
});

module.exports = app;