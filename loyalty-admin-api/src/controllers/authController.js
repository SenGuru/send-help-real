const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const { jwtSecret, jwtExpiration } = require('../config/config');

// Generate JWT token
const generateToken = (admin) => {
  return jwt.sign(
    { 
      id: admin.id, 
      email: admin.email,
      businessId: admin.businessId
    },
    jwtSecret,
    { expiresIn: jwtExpiration }
  );
};

// Login admin
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin by email
    const admin = await Admin.findOne({ 
      where: { 
        email: email.toLowerCase(),
        isActive: true 
      } 
    });

    if (!admin) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await admin.checkPassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        error: 'Authentication failed',
        message: 'Invalid email or password'
      });
    }

    // Update last login
    admin.lastLogin = new Date();
    await admin.save();

    // Generate token
    const token = generateToken(admin);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        lastLogin: admin.lastLogin,
        businessId: admin.businessId
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to authenticate user'
    });
  }
};

// Verify token
const verify = async (req, res) => {
  try {
    // If we reach here, the auth middleware has already verified the token
    const admin = await Admin.findByPk(req.admin.id);
    
    res.json({
      success: true,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        lastLogin: admin.lastLogin,
        businessId: admin.businessId
      }
    });

  } catch (error) {
    console.error('Token verification error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to verify token'
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

// Create initial admin (for setup)
const createInitialAdmin = async (req, res) => {
  try {
    const { email, password, firstName, lastName, businessName } = req.body;

    if (!businessName) {
      return res.status(400).json({
        error: 'Business name required',
        message: 'Business name is required to create admin account'
      });
    }

    // Create business first
    const Business = require('../models/Business');
    const business = await Business.create({
      name: businessName,
      description: 'Welcome to our loyalty program',
      contactEmail: email.toLowerCase()
    });

    // Create admin linked to business
    const admin = await Admin.create({
      email: email.toLowerCase(),
      password,
      firstName,
      lastName,
      businessId: business.id
    });

    // Generate token
    const token = generateToken(admin);

    res.status(201).json({
      success: true,
      message: 'Initial admin created successfully',
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName
      }
    });

  } catch (error) {
    console.error('Create initial admin error:', error);
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Email already exists',
        message: 'An admin with this email already exists'
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create admin account'
    });
  }
};

module.exports = {
  login,
  verify,
  logout,
  createInitialAdmin
};