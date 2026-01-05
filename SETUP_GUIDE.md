# Backend Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend
pnpm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the `backend` directory and add the following:

```env
MONGO_URI=mongodb+srv://Saheli-admin:Saheli20@saheli-cluster.ao4zf1g.mongodb.net/resturant_inventory?appName=Saheli-cluster
PORT=3000
NODE_ENV=development
JWT_SECRET=restaurant-inventory-super-secret-jwt-key-2024-change-in-production
JWT_EXPIRY=24h
JWT_REFRESH_SECRET=restaurant-inventory-refresh-token-secret-2024-change-in-production
JWT_REFRESH_EXPIRY=7d
```

### 3. Seed the Database (Optional but Recommended)
This will populate your database with sample inventory items and users:
```bash
pnpm run seed
```

After seeding, you can login with:
- **Admin:** admin@restaurant.com / admin123
- **Manager:** manager@restaurant.com / manager123
- **Staff:** staff@restaurant.com / staff123

### 4. Start the Server
```bash
# Development mode (with auto-reload)
pnpm run dev

# Production mode
pnpm start
```

The server will start on `http://localhost:3000`

## Testing the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register a User
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "role": "staff"
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@restaurant.com",
    "password": "admin123"
  }'
```

Save the `token` from the response.

### 4. Get All Inventory (Protected Route)
```bash
curl http://localhost:3000/api/inventory \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Update Inventory Usage
```bash
curl -X POST http://localhost:3000/api/inventory/update-usage \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "itemName": "Basmati Rice",
    "quantityUsed": 5,
    "reason": "Used for cooking"
  }'
```

## API Base URL
All API endpoints are prefixed with `/api`

## Features Implemented

✅ **Authentication System**
- User registration and login
- JWT token-based authentication
- Role-based access control (Admin, Manager, Staff)
- Password hashing with bcrypt

✅ **Inventory Management**
- Create, Read, Update, Delete inventory items
- Update inventory usage (deduct stock)
- Restock inventory items
- Get low stock items
- Inventory statistics
- Inventory history tracking

✅ **Security Features**
- Rate limiting on all routes
- Input validation
- Error handling
- CORS enabled

✅ **Additional Features**
- Pagination support
- Search and filter functionality
- Category-based filtering
- Stock status auto-update
- Comprehensive sample data

## Project Structure

```
backend/
├── config/          # Configuration files
├── controllers/     # Business logic
├── data/           # Sample data
├── middleware/     # Custom middleware
├── models/         # Database models
├── routes/         # API routes
├── scripts/        # Utility scripts
└── utils/          # Helper functions
```

## Troubleshooting

### MongoDB Connection Issues
- Verify your MONGO_URI is correct
- Check if your IP is whitelisted in MongoDB Atlas
- Ensure network connectivity

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 3000

### JWT Errors
- Ensure JWT_SECRET is set in .env
- Check token expiration
- Verify token is sent in Authorization header

## Next Steps

1. Test all endpoints using Postman or curl
2. Integrate with frontend
3. Add more features as needed
4. Deploy to production

