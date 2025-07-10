# Loyalty App API Documentation

## Overview
Complete API documentation for the Loyalty App backend with points system, user management, transactions, and rewards.

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## User Management

### Register User
**POST** `/users/register`

Register a new user in the loyalty program.

**Request Body:**
```json
{
  "businessCode": "STORE",
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@email.com",
  "password": "password123",
  "phoneNumber": "+1-555-123-4567",
  "dateOfBirth": "1990-01-01"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": { /* user object */ },
    "token": "jwt_token_here",
    "business": { /* business info */ }
  }
}
```

### Login User
**POST** `/users/login`

Authenticate a user and get access token.

**Request Body:**
```json
{
  "businessCode": "STORE",
  "email": "john.doe@email.com",
  "password": "password123"
}
```

### Get User Profile
**GET** `/users/profile`
*Requires Authentication*

Get current user's profile information.

### Update User Profile
**PUT** `/users/profile`
*Requires Authentication*

Update user profile information.

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1-555-123-4567",
  "preferences": {
    "emailNotifications": true,
    "smsNotifications": false
  }
}
```

### Get User Statistics
**GET** `/users/stats`
*Requires Authentication*

Get user's loyalty program statistics.

---

## Points Management

### Get Points Balance
**GET** `/points/balance`
*Requires Authentication*

Get user's current points balance and ranking information.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalPoints": 2450,
    "availablePoints": 2450,
    "lifetimePoints": 3200,
    "currentRanking": { /* ranking object */ },
    "nextRanking": { /* next ranking object */ },
    "pointsToNextRanking": 550
  }
}
```

### Get Points History
**GET** `/points/history?page=1&limit=20&type=earned_purchase`
*Requires Authentication*

Get user's points transaction history.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `type` (optional): Transaction type filter
- `startDate` (optional): Start date filter (ISO 8601)
- `endDate` (optional): End date filter (ISO 8601)

### Get Expiring Points
**GET** `/points/expiring?days=30`
*Requires Authentication*

Get points that are expiring within specified days.

### Get Points Summary
**GET** `/points/summary?period=monthly`
*Requires Authentication*

Get points earning/redemption summary by period.

**Query Parameters:**
- `period`: daily, weekly, monthly, yearly

### Get Leaderboard
**GET** `/points/leaderboard?period=this_month&limit=10`
*Requires Authentication*

Get points leaderboard for the business.

### Manual Points Adjustment (Admin)
**POST** `/points/adjust`
*Requires Authentication + Admin*

Manually adjust user points (admin only).

**Request Body:**
```json
{
  "userId": 123,
  "points": 500,
  "description": "Birthday bonus points"
}
```

---

## Transactions

### Create Transaction
**POST** `/transactions`
*Requires Authentication*

Record a purchase transaction and award points.

**Request Body:**
```json
{
  "totalAmount": 45.99,
  "subtotal": 41.81,
  "tax": 4.18,
  "discount": 0,
  "paymentMethod": "credit_card",
  "storeName": "Main Street Store",
  "storeLocation": "123 Main St, City, State",
  "items": [
    {
      "name": "Coffee",
      "price": 4.50,
      "quantity": 1
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Transaction created successfully",
  "data": {
    "transaction": { /* transaction object */ },
    "pointsTransaction": { /* points awarded */ },
    "user": { /* updated user points */ }
  }
}
```

### Get Transaction History
**GET** `/transactions?page=1&limit=20&status=completed`
*Requires Authentication*

Get user's transaction history.

### Get Transaction Details
**GET** `/transactions/:transactionId`
*Requires Authentication*

Get detailed information about a specific transaction.

### Get Transaction Statistics
**GET** `/transactions/stats/summary?period=monthly`
*Requires Authentication*

Get transaction statistics summary.

### Process Refund (Admin)
**POST** `/transactions/:transactionId/refund`
*Requires Authentication + Admin*

Process a refund for a transaction.

---

## Rewards

### Get Available Rewards
**GET** `/rewards?category=free_item&featured=true`
*Requires Authentication*

Get rewards available for the current user.

**Query Parameters:**
- `category` (optional): Reward type filter
- `minPoints` (optional): Minimum points cost
- `maxPoints` (optional): Maximum points cost
- `featured` (optional): Show only featured rewards

### Get Reward Details
**GET** `/rewards/:rewardId`
*Requires Authentication*

Get detailed information about a specific reward.

### Redeem Reward
**POST** `/rewards/:rewardId/redeem`
*Requires Authentication*

Redeem a reward using points.

**Response:**
```json
{
  "success": true,
  "message": "Reward redeemed successfully",
  "data": {
    "redemption": {
      "redemptionCode": "FREE_ITEM-1234567890-123",
      "reward": { /* reward details */ },
      "pointsRedeemed": 500,
      "balanceAfter": 1950
    },
    "user": { /* updated user points */ }
  }
}
```

### Get Redemption History
**GET** `/rewards/redemptions/history?page=1&limit=20`
*Requires Authentication*

Get user's reward redemption history.

### Create Reward (Admin)
**POST** `/rewards/admin/create`
*Requires Authentication + Admin*

Create a new reward.

**Request Body:**
```json
{
  "title": "Free Coffee",
  "description": "Enjoy a complimentary coffee of your choice",
  "pointsCost": 500,
  "type": "free_item",
  "value": 4.50,
  "termsAndConditions": "Valid for one free coffee. Cannot be combined with other offers.",
  "isFeatured": true
}
```

### Update Reward (Admin)
**PUT** `/rewards/admin/:rewardId`
*Requires Authentication + Admin*

Update an existing reward.

### Delete Reward (Admin)
**DELETE** `/rewards/admin/:rewardId`
*Requires Authentication + Admin*

Delete or deactivate a reward.

---

## Public Endpoints (No Authentication Required)

### Get Business Information
**GET** `/public/business/:businessCode`

Get public business information including rankings and active rewards.

**Response:**
```json
{
  "success": true,
  "data": {
    "business": { /* business details */ },
    "rankings": [ /* ranking tiers */ ],
    "coupons": [ /* active coupons */ ],
    "theme": { /* business theme colors */ }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [ /* validation errors if applicable */ ]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request / Validation Error
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., user already exists)
- `500` - Internal Server Error

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- User registration: 5 requests per 15 minutes per IP
- Login attempts: 10 requests per 15 minutes per IP
- General API: 100 requests per minute per user
- Admin operations: 50 requests per minute per admin

---

## Database Setup

Before using the API, run the database migrations:

```bash
npm run migrate
```

This will:
1. Create all necessary database tables
2. Set up indexes for performance
3. Insert sample data for testing

---

## Environment Variables

Required environment variables:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=loyalty_app
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# JWT
JWT_SECRET=your_jwt_secret_key

# Admin
ADMIN_KEY=your_admin_key_for_admin_operations

# Server
PORT=3000
NODE_ENV=development
```

---

## Testing the API

Example using curl:

```bash
# Register a user
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "businessCode": "STORE",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@email.com",
    "password": "password123"
  }'

# Login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "businessCode": "STORE",
    "email": "john.doe@email.com",
    "password": "password123"
  }'

# Create transaction (using token from login)
curl -X POST http://localhost:3000/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "totalAmount": 45.99,
    "subtotal": 41.81,
    "tax": 4.18,
    "storeName": "Main Street Store",
    "items": [{"name": "Coffee", "price": 4.50, "quantity": 1}]
  }'
```