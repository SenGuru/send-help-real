const Business = require('../models/Business');
const cloudinary = require('cloudinary').v2;
const { cloudinary: cloudinaryConfig } = require('../config/config');

// Configure Cloudinary
cloudinary.config(cloudinaryConfig);

// Get business information
const getBusinessInfo = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    let business = await Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({
        error: 'Business not found',
        message: 'Business information not found'
      });
    }

    res.json({
      success: true,
      business
    });

  } catch (error) {
    console.error('Get business info error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to retrieve business information'
    });
  }
};

// Update business information
const updateBusinessInfo = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const { 
      name, 
      description, 
      contactEmail, 
      contactPhone, 
      address, 
      operatingHours,
      category,
      website,
      established,
      memberSince,
      totalMembers,
      features,
      socialMedia,
      loyaltyBenefits
    } = req.body;

    let business = await Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({
        error: 'Business not found',
        message: 'Business information not found'
      });
    }

    // Prepare update data, filtering out undefined values
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (address !== undefined) updateData.address = address;
    if (operatingHours !== undefined) updateData.operatingHours = operatingHours;
    
    // Only include new fields if they exist in the model (for backward compatibility)
    if (category !== undefined) updateData.category = category;
    if (website !== undefined) updateData.website = website;
    if (established !== undefined) updateData.established = established;
    if (memberSince !== undefined) updateData.memberSince = memberSince;
    if (totalMembers !== undefined) updateData.totalMembers = parseInt(totalMembers) || 0;
    if (features !== undefined) updateData.features = features;
    if (socialMedia !== undefined) updateData.socialMedia = socialMedia;
    if (loyaltyBenefits !== undefined) updateData.loyaltyBenefits = loyaltyBenefits;

    // Update existing record
    await business.update(updateData);

    res.json({
      success: true,
      message: 'Business information updated successfully',
      business
    });

  } catch (error) {
    console.error('Update business info error:', error);
    
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({
        error: 'Validation error',
        message: error.errors.map(e => e.message).join(', '),
        details: error.errors
      });
    }

    if (error.name === 'SequelizeDatabaseError') {
      console.error('Database error details:', error.message);
      return res.status(500).json({
        error: 'Database error',
        message: 'Database update failed. Please try again or contact support.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }

    if (error.name === 'SequelizeConnectionError') {
      return res.status(500).json({
        error: 'Connection error',
        message: 'Database connection failed. Please try again.'
      });
    }

    res.status(500).json({
      error: 'Server error',
      message: 'Failed to update business information',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Upload business logo
const uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'No file uploaded',
        message: 'Please select a logo file to upload'
      });
    }

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'loyalty-app/business',
      transformation: [
        { width: 500, height: 500, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    });

    // Update business record with logo URL
    const businessId = req.admin.businessId;
    let business = await Business.findByPk(businessId);
    
    if (!business) {
      return res.status(404).json({
        error: 'Business not found',
        message: 'Business information not found'
      });
    }

    // Delete old logo from Cloudinary if exists
    if (business.logoUrl) {
      const publicId = business.logoUrl.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`loyalty-app/business/${publicId}`);
    }
    
    await business.update({ logoUrl: result.secure_url });

    res.json({
      success: true,
      message: 'Logo uploaded successfully',
      logoUrl: result.secure_url,
      business
    });

  } catch (error) {
    console.error('Upload logo error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to upload logo'
    });
  }
};

// Delete business logo
const deleteLogo = async (req, res) => {
  try {
    const businessId = req.admin.businessId;
    const business = await Business.findByPk(businessId);
    
    if (!business || !business.logoUrl) {
      return res.status(404).json({
        error: 'Logo not found',
        message: 'No logo to delete'
      });
    }

    // Delete from Cloudinary
    const publicId = business.logoUrl.split('/').pop().split('.')[0];
    await cloudinary.uploader.destroy(`loyalty-app/business/${publicId}`);

    // Update business record
    await business.update({ logoUrl: null });

    res.json({
      success: true,
      message: 'Logo deleted successfully',
      business
    });

  } catch (error) {
    console.error('Delete logo error:', error);
    res.status(500).json({
      error: 'Server error',
      message: 'Failed to delete logo'
    });
  }
};

module.exports = {
  getBusinessInfo,
  updateBusinessInfo,
  uploadLogo,
  deleteLogo
};