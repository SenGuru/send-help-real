const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const { jwtSecret } = require('../config/config');

const authenticateSuperAdmin = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'No token provided'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, jwtSecret);
    
    // Check if it's a superadmin token
    if (decoded.type !== 'superadmin') {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid token type'
      });
    }

    // Find superadmin
    const superadmin = await SuperAdmin.findByPk(decoded.id);
    
    if (!superadmin || !superadmin.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'SuperAdmin not found or inactive'
      });
    }

    // Add user to request object
    req.user = {
      id: superadmin.id,
      email: superadmin.email,
      role: superadmin.role,
      type: 'superadmin'
    };

    next();
  } catch (error) {
    console.error('SuperAdmin authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Token expired'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Authentication failed'
    });
  }
};

module.exports = {
  authenticateSuperAdmin
};