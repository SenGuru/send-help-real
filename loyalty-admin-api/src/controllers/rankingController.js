const Ranking = require('../models/Ranking');
const { Op } = require('sequelize');

// Get all rankings
const getRankings = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const rankings = await Ranking.findAll({
      where: { businessId },
      order: [['level', 'ASC']]
    });

    // If no rankings exist, create default ones
    if (rankings.length === 0) {
      const defaultRankings = [
        {
          businessId,
          level: 1,
          title: 'Bronze Explorer',
          pointsRequired: 0,
          color: '#CD7F32',
          benefits: {
            discountPercentage: 5,
            specialOffers: ['Welcome bonus'],
            prioritySupport: false,
            freeShipping: false
          }
        },
        {
          businessId,
          level: 2,
          title: 'Silver Adventurer',
          pointsRequired: 500,
          color: '#C0C0C0',
          benefits: {
            discountPercentage: 10,
            specialOffers: ['Monthly deals', 'Birthday bonus'],
            prioritySupport: false,
            freeShipping: false
          }
        },
        {
          businessId,
          level: 3,
          title: 'Gold Champion',
          pointsRequired: 1000,
          color: '#FFD700',
          benefits: {
            discountPercentage: 15,
            specialOffers: ['Exclusive events', 'Early access', 'VIP deals'],
            prioritySupport: true,
            freeShipping: true
          }
        }
      ];

      const createdRankings = await Ranking.bulkCreate(defaultRankings);
      
      return res.json({
        success: true,
        rankings: createdRankings,
        message: 'Default rankings created'
      });
    }

    res.json({
      success: true,
      rankings
    });

  } catch (error) {
    console.error('Get rankings error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve rankings'
    });
  }
};

// Get single ranking
const getRanking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ranking = await Ranking.findByPk(id);
    
    if (!ranking) {
      return res.status(404).json({
        error: 'Ranking not found',
        message: 'The requested ranking does not exist'
      });
    }

    res.json({
      success: true,
      ranking
    });

  } catch (error) {
    console.error('Get ranking error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve ranking'
    });
  }
};

// Create new ranking
const createRanking = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { level, title, pointsRequired, benefits, color, iconUrl } = req.body;

    // Check if level already exists for this business
    const existingRanking = await Ranking.findOne({ 
      where: { businessId, level } 
    });
    if (existingRanking) {
      return res.status(400).json({
        error: 'Level already exists',
        message: `A ranking with level ${level} already exists`
      });
    }

    // Validate points progression
    const higherRanking = await Ranking.findOne({
      where: {
        level: { [Op.gt]: level },
        pointsRequired: { [Op.lte]: pointsRequired }
      }
    });

    if (higherRanking) {
      return res.status(400).json({
        error: 'Invalid points requirement',
        message: 'Points required must be less than higher level rankings'
      });
    }

    const lowerRanking = await Ranking.findOne({
      where: {
        level: { [Op.lt]: level },
        pointsRequired: { [Op.gte]: pointsRequired }
      }
    });

    if (lowerRanking) {
      return res.status(400).json({
        error: 'Invalid points requirement',
        message: 'Points required must be greater than lower level rankings'
      });
    }

    const ranking = await Ranking.create({
      businessId,
      level,
      title,
      pointsRequired,
      benefits: benefits || {
        discountPercentage: 0,
        specialOffers: [],
        prioritySupport: false,
        freeShipping: false
      },
      color: color || '#9CAF88',
      iconUrl
    });

    res.status(201).json({
      success: true,
      message: 'Ranking created successfully',
      ranking
    });

  } catch (error) {
    console.error('Create ranking error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        error: 'Duplicate level',
        message: 'A ranking with this level already exists'
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to create ranking'
    });
  }
};

// Update ranking
const updateRanking = async (req, res) => {
  try {
    const { id } = req.params;
    const { level, title, pointsRequired, benefits, color, iconUrl } = req.body;

    const ranking = await Ranking.findByPk(id);
    if (!ranking) {
      return res.status(404).json({
        error: 'Ranking not found',
        message: 'The requested ranking does not exist'
      });
    }

    // If level is being changed, validate it doesn't conflict
    if (level && level !== ranking.level) {
      const existingRanking = await Ranking.findOne({ 
        where: { 
          level,
          id: { [Op.ne]: id }
        } 
      });
      
      if (existingRanking) {
        return res.status(400).json({
          error: 'Level already exists',
          message: `A ranking with level ${level} already exists`
        });
      }
    }

    // Validate points progression if points are being changed
    if (pointsRequired !== undefined && pointsRequired !== ranking.pointsRequired) {
      const currentLevel = level || ranking.level;
      
      const higherRanking = await Ranking.findOne({
        where: {
          level: { [Op.gt]: currentLevel },
          pointsRequired: { [Op.lte]: pointsRequired },
          id: { [Op.ne]: id }
        }
      });

      if (higherRanking) {
        return res.status(400).json({
          error: 'Invalid points requirement',
          message: 'Points required must be less than higher level rankings'
        });
      }

      const lowerRanking = await Ranking.findOne({
        where: {
          level: { [Op.lt]: currentLevel },
          pointsRequired: { [Op.gte]: pointsRequired },
          id: { [Op.ne]: id }
        }
      });

      if (lowerRanking) {
        return res.status(400).json({
          error: 'Invalid points requirement',
          message: 'Points required must be greater than lower level rankings'
        });
      }
    }

    await ranking.update({
      level: level || ranking.level,
      title: title || ranking.title,
      pointsRequired: pointsRequired !== undefined ? pointsRequired : ranking.pointsRequired,
      benefits: benefits || ranking.benefits,
      color: color || ranking.color,
      iconUrl: iconUrl !== undefined ? iconUrl : ranking.iconUrl
    });

    res.json({
      success: true,
      message: 'Ranking updated successfully',
      ranking
    });

  } catch (error) {
    console.error('Update ranking error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', ')
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update ranking'
    });
  }
};

// Delete ranking
const deleteRanking = async (req, res) => {
  try {
    const { id } = req.params;

    const ranking = await Ranking.findByPk(id);
    if (!ranking) {
      return res.status(404).json({
        error: 'Ranking not found',
        message: 'The requested ranking does not exist'
      });
    }

    // Check if this is the only ranking
    const totalRankings = await Ranking.count();
    if (totalRankings === 1) {
      return res.status(400).json({
        error: 'Cannot delete',
        message: 'Cannot delete the last remaining ranking'
      });
    }

    await ranking.destroy();

    res.json({
      success: true,
      message: 'Ranking deleted successfully'
    });

  } catch (error) {
    console.error('Delete ranking error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete ranking'
    });
  }
};

// Reorder rankings
const reorderRankings = async (req, res) => {
  try {
    const { rankings } = req.body; // Array of { id, level, pointsRequired }

    if (!Array.isArray(rankings)) {
      return res.status(400).json({
        error: 'Invalid data',
        message: 'Rankings must be an array'
      });
    }

    // Validate that points are in ascending order
    const sortedByLevel = rankings.sort((a, b) => a.level - b.level);
    for (let i = 1; i < sortedByLevel.length; i++) {
      if (sortedByLevel[i].pointsRequired <= sortedByLevel[i-1].pointsRequired) {
        return res.status(400).json({
          error: 'Invalid points progression',
          message: 'Points required must increase with ranking level'
        });
      }
    }

    // Update all rankings
    const updatePromises = rankings.map(({ id, level, pointsRequired }) =>
      Ranking.update(
        { level, pointsRequired },
        { where: { id } }
      )
    );

    await Promise.all(updatePromises);

    // Fetch updated rankings
    const updatedRankings = await Ranking.findAll({
      order: [['level', 'ASC']]
    });

    res.json({
      success: true,
      message: 'Rankings reordered successfully',
      rankings: updatedRankings
    });

  } catch (error) {
    console.error('Reorder rankings error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to reorder rankings'
    });
  }
};

module.exports = {
  getRankings,
  getRanking,
  createRanking,
  updateRanking,
  deleteRanking,
  reorderRankings
};