const MenuItem = require('../models/MenuItem');
const MenuItemPurchase = require('../models/MenuItemPurchase');

// Get all menu items for a business
const getMenuItems = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { category, includeInactive } = req.query;
    
    let whereClause = { businessId };
    
    if (category) {
      whereClause.category = category;
    }
    
    if (!includeInactive || includeInactive === 'false') {
      whereClause.isActive = true;
    }

    const menuItems = await MenuItem.findAll({
      where: whereClause,
      order: [['category', 'ASC'], ['sortOrder', 'ASC'], ['name', 'ASC']]
    });

    res.json({
      success: true,
      menuItems
    });

  } catch (error) {
    console.error('Get menu items error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve menu items'
    });
  }
};

// Get menu categories
const getMenuCategories = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    
    const categories = await MenuItem.getCategories(businessId);

    res.json({
      success: true,
      categories
    });

  } catch (error) {
    console.error('Get menu categories error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve menu categories'
    });
  }
};

// Create new menu item
const createMenuItem = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { 
      name, 
      description, 
      category, 
      price, 
      pointsEarned, 
      imageUrl, 
      isAvailable = true,
      sortOrder = 0,
      metadata = {}
    } = req.body;

    const menuItem = await MenuItem.create({
      businessId,
      name,
      description,
      category,
      price: parseFloat(price),
      pointsEarned: parseInt(pointsEarned),
      imageUrl,
      isAvailable,
      sortOrder: parseInt(sortOrder),
      metadata
    });

    res.status(201).json({
      success: true,
      message: 'Menu item created successfully',
      menuItem
    });

  } catch (error) {
    console.error('Create menu item error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create menu item'
    });
  }
};

// Update menu item
const updateMenuItem = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { id } = req.params;
    const { 
      name, 
      description, 
      category, 
      price, 
      pointsEarned, 
      imageUrl, 
      isAvailable,
      sortOrder,
      metadata
    } = req.body;

    const menuItem = await MenuItem.findOne({
      where: { id, businessId }
    });

    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found',
        message: 'Menu item not found or access denied'
      });
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (category !== undefined) updateData.category = category;
    if (price !== undefined) updateData.price = parseFloat(price);
    if (pointsEarned !== undefined) updateData.pointsEarned = parseInt(pointsEarned);
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
    if (isAvailable !== undefined) updateData.isAvailable = isAvailable;
    if (sortOrder !== undefined) updateData.sortOrder = parseInt(sortOrder);
    if (metadata !== undefined) updateData.metadata = metadata;

    await menuItem.update(updateData);

    res.json({
      success: true,
      message: 'Menu item updated successfully',
      menuItem
    });

  } catch (error) {
    console.error('Update menu item error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update menu item'
    });
  }
};

// Delete menu item
const deleteMenuItem = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { id } = req.params;

    const menuItem = await MenuItem.findOne({
      where: { id, businessId }
    });

    if (!menuItem) {
      return res.status(404).json({
        error: 'Menu item not found',
        message: 'Menu item not found or access denied'
      });
    }

    // Check if there are any purchases of this item
    const purchaseCount = await MenuItemPurchase.count({
      where: { menuItemId: id }
    });

    if (purchaseCount > 0) {
      // Don't delete, just deactivate
      await menuItem.update({ isActive: false });
      return res.json({
        success: true,
        message: 'Menu item deactivated (has purchase history)'
      });
    }

    await menuItem.destroy();

    res.json({
      success: true,
      message: 'Menu item deleted successfully'
    });

  } catch (error) {
    console.error('Delete menu item error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete menu item'
    });
  }
};

// Record menu item purchase
const recordPurchase = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId, menuItemId, quantity = 1, paymentMethod, notes } = req.body;

    const purchase = await MenuItemPurchase.createPurchase({
      businessId,
      userId,
      menuItemId,
      quantity: parseInt(quantity),
      paymentMethod,
      notes
    });

    // Include menu item details in response
    await purchase.reload({
      include: [{
        model: MenuItem,
        as: 'menuItem',
        attributes: ['name', 'category']
      }]
    });

    res.status(201).json({
      success: true,
      message: 'Purchase recorded successfully',
      purchase
    });

  } catch (error) {
    console.error('Record purchase error:', error);
    res.status(400).json({
      error: 'Purchase failed',
      message: error.message
    });
  }
};

// Get purchase history
const getPurchaseHistory = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { userId, startDate, endDate, limit = 50 } = req.query;

    let whereClause = { businessId };
    
    if (userId) {
      whereClause.userId = userId;
    }
    
    if (startDate && endDate) {
      whereClause.purchaseDate = {
        [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const purchases = await MenuItemPurchase.findAll({
      where: whereClause,
      include: [
        {
          model: MenuItem,
          as: 'menuItem',
          attributes: ['name', 'category', 'imageUrl']
        },
        {
          model: require('../models/User'),
          as: 'user',
          attributes: ['firstName', 'lastName', 'email']
        }
      ],
      order: [['purchaseDate', 'DESC']],
      limit: parseInt(limit)
    });

    res.json({
      success: true,
      purchases
    });

  } catch (error) {
    console.error('Get purchase history error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve purchase history'
    });
  }
};

// Get menu statistics
const getMenuStats = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { startDate, endDate } = req.query;

    const stats = await MenuItemPurchase.getBusinessStats(
      businessId, 
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );

    // Get popular items
    const popularItems = await MenuItemPurchase.findAll({
      where: { businessId },
      attributes: [
        'menuItemId',
        [require('sequelize').fn('COUNT', '*'), 'purchaseCount'],
        [require('sequelize').fn('SUM', require('sequelize').col('quantity')), 'totalQuantity'],
        [require('sequelize').fn('SUM', require('sequelize').col('total_amount')), 'totalRevenue']
      ],
      include: [{
        model: MenuItem,
        as: 'menuItem',
        attributes: ['name', 'category', 'price']
      }],
      group: ['menuItemId', 'menuItem.id'],
      order: [[require('sequelize').fn('COUNT', '*'), 'DESC']],
      limit: 10
    });

    res.json({
      success: true,
      stats: {
        ...stats,
        popularItems: popularItems.map(item => ({
          menuItem: item.menuItem,
          purchaseCount: parseInt(item.dataValues.purchaseCount),
          totalQuantity: parseInt(item.dataValues.totalQuantity),
          totalRevenue: parseFloat(item.dataValues.totalRevenue)
        }))
      }
    });

  } catch (error) {
    console.error('Get menu stats error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve menu statistics'
    });
  }
};

module.exports = {
  getMenuItems,
  getMenuCategories,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  recordPurchase,
  getPurchaseHistory,
  getMenuStats
};