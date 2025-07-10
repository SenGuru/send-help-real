# Loyalty Program Admin API

A comprehensive backend API for managing a loyalty program mobile app through an admin panel.

## Features

- **Authentication System** - Secure JWT-based admin authentication
- **Business Management** - Control business info, logo, contact details
- **Theme Control** - Customize app color palette and themes
- **Ranking System** - Create custom loyalty rank titles and benefits
- **Coupon Management** - Create, manage, and track promotional coupons
- **File Upload** - Cloudinary integration for logo and image management

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL with Sequelize ORM
- **Authentication**: JWT tokens with bcryptjs
- **File Storage**: Cloudinary
- **Validation**: express-validator
- **Security**: Helmet, CORS

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Setup
Copy `.env` file and update with your values:
```bash
# Database (DigitalOcean Managed Database)
DB_HOST=your-db-host
DB_NAME=loyalty_admin
DB_USER=your-db-user
DB_PASSWORD=your-db-password

# JWT Secret (generate a secure random string)
JWT_SECRET=your-super-secret-jwt-key

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Initial Admin Account
ADMIN_EMAIL=admin@yourbusiness.com
ADMIN_PASSWORD=admin123
```

### 3. Run the Application
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

### 4. Database Initialization
The app automatically:
- Creates database tables
- Sets up initial admin account
- Creates default theme and rankings
- Adds sample coupons

## API Endpoints

### Authentication
- `POST /api/auth/login` - Admin login
- `GET /api/auth/verify` - Verify JWT token
- `POST /api/auth/logout` - Logout (client-side)
- `POST /api/auth/setup` - Create initial admin (one-time)

### Business Management
- `GET /api/business/info` - Get business information
- `PUT /api/business/info` - Update business information
- `POST /api/business/logo` - Upload business logo
- `DELETE /api/business/logo` - Delete business logo

### Theme Control
- `GET /api/theme/colors` - Get current theme colors
- `PUT /api/theme/colors` - Update theme colors
- `GET /api/theme/presets` - Get all theme presets
- `POST /api/theme/presets` - Create theme preset
- `PUT /api/theme/presets/:id/apply` - Apply theme preset

### Rankings System
- `GET /api/rankings` - Get all rankings
- `GET /api/rankings/:id` - Get single ranking
- `POST /api/rankings` - Create new ranking
- `PUT /api/rankings/:id` - Update ranking
- `DELETE /api/rankings/:id` - Delete ranking
- `PUT /api/rankings/reorder` - Reorder rankings

### Coupon Management
- `GET /api/coupons` - Get all coupons (with pagination)
- `GET /api/coupons/:id` - Get single coupon
- `POST /api/coupons` - Create new coupon
- `PUT /api/coupons/:id` - Update coupon
- `DELETE /api/coupons/:id` - Delete coupon
- `PATCH /api/coupons/:id/toggle` - Toggle coupon status
- `GET /api/coupons/:id/analytics` - Get coupon analytics
- `PUT /api/coupons/bulk` - Bulk operations on coupons

## Request/Response Examples

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@yourbusiness.com",
  "password": "admin123"
}
```

### Update Theme Colors
```bash
PUT /api/theme/colors
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "colors": {
    "primary": "#9CAF88",
    "secondary": "#F5F5DC",
    "accent": "#7A8B6B",
    "background": "#FAFAF0",
    "text": "#333333"
  }
}
```

### Create Ranking
```bash
POST /api/rankings
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "level": 4,
  "title": "Platinum Elite",
  "pointsRequired": 2000,
  "color": "#E5E4E2",
  "benefits": {
    "discountPercentage": 20,
    "specialOffers": ["Concierge service", "Premium support"],
    "prioritySupport": true,
    "freeShipping": true
  }
}
```

### Create Coupon
```bash
POST /api/coupons
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "title": "Black Friday Sale",
  "description": "25% off everything",
  "code": "BLACKFRIDAY25",
  "discountType": "percentage",
  "discountValue": 25,
  "minimumPurchase": 100,
  "expirationDate": "2024-12-01",
  "usageLimit": 500
}
```

## Database Schema

### Admin
- `id`, `email`, `password`, `firstName`, `lastName`, `isActive`, `lastLogin`

### Business
- `id`, `name`, `description`, `logoUrl`, `contactEmail`, `contactPhone`, `address`, `operatingHours`

### Theme
- `id`, `name`, `colors` (JSONB), `isActive`

### Ranking
- `id`, `level`, `title`, `pointsRequired`, `benefits` (JSONB), `color`, `iconUrl`

### Coupon
- `id`, `title`, `description`, `code`, `discountType`, `discountValue`, `minimumPurchase`, `expirationDate`, `usageLimit`, `usedCount`, `isActive`, `targetRankingLevel`

## Deployment

### DigitalOcean App Platform
1. Create new app from GitHub repository
2. Set environment variables in app settings
3. Configure managed database connection
4. Deploy!

### Manual Deployment
```bash
# Build and start
npm install --production
npm start
```

## Security Features

- JWT authentication with secure tokens
- Password hashing with bcryptjs
- Request validation and sanitization
- CORS and security headers
- File upload restrictions
- SQL injection prevention with Sequelize ORM

## Development

### Project Structure
```
src/
├── controllers/     # Business logic
├── models/         # Database models
├── routes/         # API routes
├── middleware/     # Auth, validation, etc.
└── config/         # Database, app config
```

### Adding New Features
1. Create model in `src/models/`
2. Create controller in `src/controllers/`
3. Add routes in `src/routes/`
4. Add validation in `src/middleware/validation.js`
5. Update `server.js` to include new routes

## Support

For issues and questions, please check:
- API logs for error details
- Database connection status
- Environment variables configuration
- Cloudinary setup for file uploads