// Simple validation middleware without express-validator
const validateId = (req, res, next) => {
  const { id } = req.params;
  if (!id || isNaN(parseInt(id)) || parseInt(id) < 1) {
    return res.status(400).json({
      error: 'Invalid ID',
      message: 'ID must be a positive integer'
    });
  }
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Email and password are required'
    });
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      error: 'Invalid email',
      message: 'Please provide a valid email address'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      error: 'Invalid password',
      message: 'Password must be at least 6 characters'
    });
  }
  
  next();
};

const validateBusinessInfo = (req, res, next) => {
  const { 
    name, 
    contactEmail, 
    website, 
    established, 
    memberSince, 
    totalMembers,
    features,
    socialMedia,
    loyaltyBenefits
  } = req.body;
  
  if (!name || name.trim().length === 0) {
    return res.status(400).json({
      error: 'Missing business name',
      message: 'Business name is required'
    });
  }
  
  // Validate email format if provided
  if (contactEmail && contactEmail.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail)) {
      return res.status(400).json({
        error: 'Invalid email',
        message: 'Please provide a valid contact email address'
      });
    }
  }
  
  // Validate website URL if provided
  if (website && website.trim() !== '') {
    try {
      new URL(website);
    } catch {
      return res.status(400).json({
        error: 'Invalid website URL',
        message: 'Please provide a valid website URL'
      });
    }
  }
  
  // Validate year fields if provided
  const currentYear = new Date().getFullYear();
  if (established && established.trim() !== '') {
    const year = parseInt(established);
    if (isNaN(year) || year < 1800 || year > currentYear) {
      return res.status(400).json({
        error: 'Invalid established year',
        message: 'Established year must be between 1800 and current year'
      });
    }
  }
  
  if (memberSince && memberSince.trim() !== '') {
    const year = parseInt(memberSince);
    if (isNaN(year) || year < 2000 || year > currentYear) {
      return res.status(400).json({
        error: 'Invalid member since year',
        message: 'Member since year must be between 2000 and current year'
      });
    }
  }
  
  // Validate totalMembers if provided
  if (totalMembers !== undefined && totalMembers !== null && totalMembers !== '') {
    const members = parseInt(totalMembers);
    if (isNaN(members) || members < 0) {
      return res.status(400).json({
        error: 'Invalid total members',
        message: 'Total members must be a non-negative number'
      });
    }
  }
  
  // Validate features array if provided
  if (features !== undefined && features !== null) {
    if (!Array.isArray(features)) {
      return res.status(400).json({
        error: 'Invalid features',
        message: 'Features must be an array'
      });
    }
  }
  
  // Validate socialMedia object if provided
  if (socialMedia !== undefined && socialMedia !== null) {
    if (typeof socialMedia !== 'object' || Array.isArray(socialMedia)) {
      return res.status(400).json({
        error: 'Invalid social media',
        message: 'Social media must be an object'
      });
    }
  }
  
  // Validate loyaltyBenefits array if provided
  if (loyaltyBenefits !== undefined && loyaltyBenefits !== null) {
    if (!Array.isArray(loyaltyBenefits)) {
      return res.status(400).json({
        error: 'Invalid loyalty benefits',
        message: 'Loyalty benefits must be an array'
      });
    }
  }
  
  next();
};

const validateTheme = (req, res, next) => {
  const { colors } = req.body;
  
  if (!colors || typeof colors !== 'object') {
    return res.status(400).json({
      error: 'Invalid colors',
      message: 'Colors must be an object'
    });
  }
  
  const requiredColors = ['primary', 'secondary', 'accent'];
  const missingColors = requiredColors.filter(color => !colors[color]);
  
  if (missingColors.length > 0) {
    return res.status(400).json({
      error: 'Missing required colors',
      message: `Missing colors: ${missingColors.join(', ')}`
    });
  }
  
  next();
};

const validateRanking = (req, res, next) => {
  const { level, title, pointsRequired } = req.body;
  
  if (!level || !title || pointsRequired === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Level, title, and pointsRequired are required'
    });
  }
  
  if (isNaN(parseInt(level)) || parseInt(level) < 1 || parseInt(level) > 10) {
    return res.status(400).json({
      error: 'Invalid level',
      message: 'Level must be between 1 and 10'
    });
  }
  
  if (isNaN(parseInt(pointsRequired)) || parseInt(pointsRequired) < 0) {
    return res.status(400).json({
      error: 'Invalid points required',
      message: 'Points required must be a non-negative number'
    });
  }
  
  next();
};

const validateCoupon = (req, res, next) => {
  const { title, code, discountType, discountValue } = req.body;
  
  if (!title || !code || !discountType || discountValue === undefined) {
    return res.status(400).json({
      error: 'Missing required fields',
      message: 'Title, code, discountType, and discountValue are required'
    });
  }
  
  if (!['percentage', 'fixed', 'points'].includes(discountType)) {
    return res.status(400).json({
      error: 'Invalid discount type',
      message: 'Discount type must be percentage, fixed, or points'
    });
  }
  
  if (isNaN(parseFloat(discountValue)) || parseFloat(discountValue) < 0) {
    return res.status(400).json({
      error: 'Invalid discount value',
      message: 'Discount value must be a positive number'
    });
  }
  
  next();
};

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;
  
  if (page && (isNaN(parseInt(page)) || parseInt(page) < 1)) {
    return res.status(400).json({
      error: 'Invalid page',
      message: 'Page must be a positive integer'
    });
  }
  
  if (limit && (isNaN(parseInt(limit)) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    return res.status(400).json({
      error: 'Invalid limit',
      message: 'Limit must be between 1 and 100'
    });
  }
  
  next();
};

module.exports = {
  validateId,
  validateLogin,
  validateBusinessInfo,
  validateTheme,
  validateRanking,
  validateCoupon,
  validatePagination
};