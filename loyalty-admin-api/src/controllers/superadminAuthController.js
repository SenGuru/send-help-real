const jwt = require('jsonwebtoken');
const SuperAdmin = require('../models/SuperAdmin');
const { jwtSecret, jwtExpiration } = require('../config/config');

// Generate JWT token for superadmin
const generateToken = (superadmin) => {
  return jwt.sign(
    { 
      id: superadmin.id, 
      email: superadmin.email,
      role: superadmin.role,
      type: 'superadmin'
    },
    jwtSecret,
    { expiresIn: jwtExpiration }
  );
};

// Login superadmin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find superadmin by email
    const superadmin = await SuperAdmin.findOne({ 
      where: { 
        email: email.toLowerCase(),
        isActive: true 
      } 
    });

    if (!superadmin) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await superadmin.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    superadmin.lastLogin = new Date();
    await superadmin.save();

    // Generate token
    const token = generateToken(superadmin);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: superadmin.getSafeData()
      }
    });

  } catch (error) {
    console.error('SuperAdmin login error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to authenticate user'
    });
  }
};

// Verify token
const verify = async (req, res) => {
  try {
    // If we reach here, the auth middleware has already verified the token
    const superadmin = await SuperAdmin.findByPk(req.user.id);
    
    if (!superadmin) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: superadmin.getSafeData()
      }
    });

  } catch (error) {
    console.error('SuperAdmin token verification error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to verify token'
    });
  }
};

// Get profile
const profile = async (req, res) => {
  try {
    const superadmin = await SuperAdmin.findByPk(req.user.id);
    
    if (!superadmin) {
      return res.status(404).json({
        success: false,
        error: 'User not found',
        message: 'SuperAdmin not found'
      });
    }

    res.json({
      success: true,
      data: {
        user: superadmin.getSafeData()
      }
    });

  } catch (error) {
    console.error('SuperAdmin profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to get profile'
    });
  }
};

// Logout (client-side token removal)
const logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
};

// Create initial superadmin (for setup)
const createInitialSuperAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Check if any superadmin already exists
    const existingCount = await SuperAdmin.count();
    if (existingCount > 0) {
      return res.status(400).json({
        success: false,
        error: 'Setup already completed',
        message: 'SuperAdmin account already exists'
      });
    }

    // Create initial superadmin
    const superadmin = await SuperAdmin.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      role: 'superadmin'
    });

    // Generate token
    const token = generateToken(superadmin);

    res.status(201).json({
      success: true,
      message: 'Initial SuperAdmin created successfully',
      data: {
        token,
        user: superadmin.getSafeData()
      }
    });

  } catch (error) {
    console.error('Create initial SuperAdmin error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        error: 'Email already exists',
        message: 'A SuperAdmin with this email already exists'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Server error',
      message: 'Failed to create SuperAdmin account'
    });
  }
};

module.exports = {
  login,
  verify,
  profile,
  logout,
  createInitialSuperAdmin
};