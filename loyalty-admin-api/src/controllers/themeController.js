const Theme = require('../models/Theme');

// Get current active theme colors
const getColors = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    
    let activeTheme = await Theme.findOne({ 
      where: { 
        businessId,
        isActive: true 
      } 
    });

    if (!activeTheme) {
      // Create default theme if none exists
      activeTheme = await Theme.create({
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
    }

    res.json({
      success: true,
      colors: activeTheme.colors,
      theme: activeTheme
    });

  } catch (error) {
    console.error('Get colors error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve theme colors'
    });
  }
};

// Update theme colors
const updateColors = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { colors, name } = req.body;

    // Validate required colors
    const requiredColors = ['primary', 'secondary', 'accent', 'background', 'text'];
    const missingColors = requiredColors.filter(color => !colors[color]);
    
    if (missingColors.length > 0) {
      return res.status(400).json({
        error: 'Missing required colors',
        message: `The following colors are required: ${missingColors.join(', ')}`
      });
    }

    // Deactivate current active theme for this business
    await Theme.update(
      { isActive: false },
      { where: { businessId, isActive: true } }
    );

    // Create new active theme
    const newTheme = await Theme.create({
      businessId,
      name: name || `Custom Theme ${Date.now()}`,
      colors,
      isActive: true
    });

    res.json({
      success: true,
      message: 'Theme colors updated successfully',
      colors: newTheme.colors,
      theme: newTheme
    });

  } catch (error) {
    console.error('Update colors error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update theme colors'
    });
  }
};

// Get all theme presets
const getPresets = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const themes = await Theme.findAll({
      where: { businessId },
      order: [['created_at', 'DESC']]
    });

    // Add some predefined theme presets
    const predefinedPresets = [
      {
        id: 'sage-green',
        name: 'Sage Green (Default)',
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
        isPredefined: true
      },
      {
        id: 'ocean-blue',
        name: 'Ocean Blue',
        colors: {
          primary: '#2E86AB',
          secondary: '#A23B72',
          accent: '#F18F01',
          background: '#F8F9FA',
          text: '#2C3E50',
          lightGray: '#E9ECEF',
          darkGray: '#6C757D',
          success: '#28A745',
          warning: '#FFC107',
          error: '#DC3545',
          info: '#17A2B8'
        },
        isPredefined: true
      },
      {
        id: 'warm-sunset',
        name: 'Warm Sunset',
        colors: {
          primary: '#FF6B6B',
          secondary: '#4ECDC4',
          accent: '#45B7D1',
          background: '#FFF8F0',
          text: '#2C3E50',
          lightGray: '#F1F2F6',
          darkGray: '#57606F',
          success: '#2ED573',
          warning: '#FFA502',
          error: '#FF3742',
          info: '#3742FA'
        },
        isPredefined: true
      }
    ];

    res.json({
      success: true,
      presets: [...predefinedPresets, ...themes],
      customThemes: themes
    });

  } catch (error) {
    console.error('Get presets error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve theme presets'
    });
  }
};

// Create theme preset
const createPreset = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { name, colors } = req.body;

    const theme = await Theme.create({
      businessId,
      name,
      colors,
      isActive: false
    });

    res.status(201).json({
      success: true,
      message: 'Theme preset created successfully',
      theme
    });

  } catch (error) {
    console.error('Create preset error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create theme preset'
    });
  }
};

// Apply theme preset
const applyPreset = async (req, res) => {
  try {
    const { id } = req.params;

    const theme = await Theme.findByPk(id);
    if (!theme) {
      return res.status(404).json({
        error: 'Theme not found',
        message: 'The requested theme preset does not exist'
      });
    }

    // Deactivate current active theme
    await Theme.update(
      { isActive: false },
      { where: { isActive: true } }
    );

    // Activate selected theme
    await theme.update({ isActive: true });

    res.json({
      success: true,
      message: 'Theme preset applied successfully',
      colors: theme.colors,
      theme
    });

  } catch (error) {
    console.error('Apply preset error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to apply theme preset'
    });
  }
};

// Delete theme preset
const deletePreset = async (req, res) => {
  try {
    const { id } = req.params;
    const businessId = req.admin.businessId;

    const theme = await Theme.findOne({
      where: { 
        id,
        businessId // Ensure user can only delete their own themes
      }
    });

    if (!theme) {
      return res.status(404).json({
        error: 'Theme not found',
        message: 'The requested theme preset does not exist or you do not have permission to delete it'
      });
    }

    // Don't allow deleting the active theme
    if (theme.isActive) {
      return res.status(400).json({
        error: 'Cannot delete active theme',
        message: 'Cannot delete the currently active theme. Please activate another theme first.'
      });
    }

    await theme.destroy();

    res.json({
      success: true,
      message: 'Theme preset deleted successfully'
    });

  } catch (error) {
    console.error('Delete preset error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete theme preset'
    });
  }
};

module.exports = {
  getColors,
  updateColors,
  getPresets,
  createPreset,
  applyPreset,
  deletePreset
};