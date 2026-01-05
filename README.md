# Restaurant Inventory Management System - Backend API

A comprehensive REST API backend for managing restaurant inventory with authentication, rate limiting, and advanced features.

## Features

- ✅ **JWT Authentication** - Secure user authentication with JWT tokens
- ✅ **Role-Based Access Control** - Admin, Manager, and Staff roles
- ✅ **Rate Limiting** - Protection against abuse
- ✅ **Inventory Management** - Full CRUD operations for inventory items
- ✅ **Inventory History** - Track all inventory changes and transactions
- ✅ **Low Stock Alerts** - Automatic stock status management
- ✅ **Statistics & Analytics** - Inventory statistics and reporting
- ✅ **Input Validation** - Request validation using express-validator
- ✅ **Error Handling** - Comprehensive error handling middleware
- ✅ **MongoDB Integration** - MongoDB with Mongoose ODM

## Tech Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-rate-limit** - Rate limiting
- **express-validator** - Input validation

## Project Structure

```
backend/
├── config/
│   ├── database.js          # MongoDB connection
│   └── constants.js          # Application constants
├── controllers/
│   ├── authController.js     # Authentication logic
│   └── inventoryController.js # Inventory management logic
├── data/
│   └── sampleData.js         # Sample data for seeding
├── middleware/
│   ├── auth.js               # JWT authentication middleware
│   ├── errorHandler.js       # Global error handler
│   ├── rateLimiter.js        # Rate limiting middleware
│   └── validator.js           # Input validation middleware
├── models/
│   ├── InventorySchema.js    # Inventory model
│   ├── InventoryHistory.js   # Inventory history model
│   └── User.js                # User model
├── routes/
│   ├── authRoutes.js         # Authentication routes
│   └── inventoryRoutes.js    # Inventory routes
├── scripts/
│   └── seedData.js           # Database seeding script
├── utils/
│   ├── asyncHandler.js       # Async error handler
│   ├── errorHandler.js       # Custom error class
│   └── responseHandler.js    # Response utilities
├── server.js                 # Main server file
└── package.json              # Dependencies
```

## Installation

1. **Install dependencies:**
   ```bash
   pnpm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the backend directory:
   ```env
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   PORT=3000
   NODE_ENV=development
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRY=24h
   JWT_REFRESH_SECRET=your-refresh-token-secret
   JWT_REFRESH_EXPIRY=7d
   ```

3. **Seed the database (optional):**
   ```bash
   pnpm run seed
   ```

4. **Start the server:**
   ```bash
   # Development mode
   pnpm run dev

   # Production mode
   pnpm start
   ```

## API Endpoints

### Authentication Routes

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (Protected)
- `PUT /api/auth/update-profile` - Update user profile (Protected)
- `PUT /api/auth/change-password` - Change password (Protected)

### Inventory Routes

- `GET /api/inventory` - Get all inventory items (Protected)
- `GET /api/inventory/:id` - Get single inventory item (Protected)
- `POST /api/inventory` - Create inventory item (Admin/Manager)
- `PUT /api/inventory/:id` - Update inventory item (Admin/Manager)
- `DELETE /api/inventory/:id` - Delete inventory item (Admin)
- `POST /api/inventory/update-usage` - Update inventory usage (Protected)
- `POST /api/inventory/restock` - Restock inventory (Admin/Manager)
- `GET /api/inventory/low-stock` - Get low stock items (Protected)
- `GET /api/inventory/statistics` - Get inventory statistics (Protected)
- `GET /api/inventory/history/:itemId` - Get inventory history (Protected)

## Sample Users (After Seeding)

- **Admin:** admin@restaurant.com / admin123
- **Manager:** manager@restaurant.com / manager123
- **Staff:** staff@restaurant.com / staff123

## Request Examples

### Register User
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "staff"
}
```

### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@restaurant.com",
  "password": "admin123"
}
```

### Get All Inventory (with authentication)
```bash
GET /api/inventory
Authorization: Bearer <token>
```

### Update Inventory Usage
```bash
POST /api/inventory/update-usage
Authorization: Bearer <token>
Content-Type: application/json

{
  "itemName": "Rice",
  "quantityUsed": 5,
  "reason": "Used for cooking"
}
```

## Rate Limiting

- **General API:** 100 requests per 15 minutes
- **Authentication:** 5 requests per 15 minutes
- **Inventory Updates:** 30 requests per minute

## Error Handling

All errors follow a consistent format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on all routes
- Input validation
- Role-based access control
- CORS enabled

## Development

- Uses `nodemon` for auto-reload in development
- Environment-based configuration
- Comprehensive error logging
- Request logging in development mode

