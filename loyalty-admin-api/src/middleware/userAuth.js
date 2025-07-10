const jwt = require('jsonwebtoken');
const { User } = require('../models');

const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'loyalty_app_secret');

    // Get user from database
    const user = await User.findByPk(decoded.userId, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated'
      });
    }

    // Add user info to request
    req.user = {
      userId: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    };

    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    console.error('User authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    });
  }
};

// Middleware to check if user has admin privileges (for certain operations)
const requireAdmin = (req, res, next) => {
  // For now, we'll implement this as a simple check
  // In a real app, you might have an isAdmin field or separate admin users
  
  // This is a placeholder - you should implement proper admin checking
  // For example, checking if the user has admin role or is staff
  if (req.headers['x-admin-key'] !== process.env.ADMIN_KEY) {
    return res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
  }

  next();
};

// Middleware to check if the user belongs to the same business
const checkBusinessAccess = (req, res, next) => {
  const targetBusinessId = req.params.businessId || req.body.businessId;
  
  if (targetBusinessId && parseInt(targetBusinessId) !== req.user.businessId) {
    return res.status(403).json({
      success: false,
      message: 'Access denied - different business'
    });
  }

  next();
};

module.exports = {
  authenticateUser,
  requireAdmin,
  checkBusinessAccess
};