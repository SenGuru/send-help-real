module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiration: '24h',
  bcryptRounds: 12,
  
  // File upload configuration
  maxFileSize: 5 * 1024 * 1024, // 5MB
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/gif'],
  
  // Pagination defaults
  defaultPageSize: 20,
  maxPageSize: 100,
  
  // Cache configuration
  cacheExpiration: 3600, // 1 hour in seconds
  
  // Admin configuration
  adminEmail: process.env.ADMIN_EMAIL,
  adminPassword: process.env.ADMIN_PASSWORD,
  
  // Cloudinary configuration
  cloudinary: {
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  }
};