# Deployment Guide - Restaurant Inventory Backend

## Deploying to Render.com

### Prerequisites
1. MongoDB Atlas account (free tier available)
2. Render.com account (free tier available)
3. GitHub account (to connect your repository)

### Step 1: Prepare MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster (free tier M0)
3. Create a database user:
   - Go to Database Access → Add New Database User
   - Choose Password authentication
   - Save the username and password
4. Whitelist IP addresses:
   - Go to Network Access → Add IP Address
   - Click "Allow Access from Anywhere" (0.0.0.0/0) for Render
5. Get your connection string:
   - Go to Database → Connect → Connect your application
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/restaurant-inventory`

### Step 2: Deploy to Render

1. **Go to Render Dashboard**
   - Visit [render.com](https://render.com)
   - Sign up or log in

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the repository containing your backend code

3. **Configure the Service**
   - **Name**: `restaurant-inventory-api` (or your preferred name)
   - **Region**: Choose closest to you (e.g., Singapore, US East)
   - **Branch**: `main` or `master`
   - **Root Directory**: `assignment-5/backend` (if your repo has the full project)
   - **Runtime**: `Node`
   - **Build Command**: `npm install` or `pnpm install` (if using pnpm)
   - **Start Command**: `npm start` or `node server.js`

4. **Environment Variables**
   Add these in the Render dashboard under "Environment":
   
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/restaurant-inventory
   PORT=10000
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-min-32-chars
   JWT_EXPIRY=24h
   JWT_REFRESH_SECRET=your-refresh-token-secret-change-this-too
   JWT_REFRESH_EXPIRY=7d
   ```

   **Important**: 
   - Replace `MONGO_URI` with your actual MongoDB Atlas connection string
   - Generate strong secrets for `JWT_SECRET` and `JWT_REFRESH_SECRET` (use a random string generator)
   - Render automatically sets `PORT`, but you can specify it

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy your application
   - Wait for deployment to complete (usually 2-5 minutes)

6. **Get Your API URL**
   - Once deployed, you'll get a URL like: `https://restaurant-inventory-api.onrender.com`
   - Your API base URL will be: `https://restaurant-inventory-api.onrender.com/api`

### Step 3: Seed the Database (Optional)

After deployment, you can seed the database with sample data:

1. **Option 1: Using Render Shell**
   - Go to your service → "Shell"
   - Run: `node scripts/seedData.js`

2. **Option 2: Using Local Script**
   - Update your local `.env` with the production `MONGO_URI`
   - Run: `npm run seed` or `node scripts/seedData.js`

### Step 4: Update Frontend API URL

Update your frontend to use the deployed backend:

1. In `assignment-5/frontend/src/services/api.ts`, update:
   ```typescript
   const API_BASE_URL = 'https://restaurant-inventory-api.onrender.com/api';
   ```

2. Or use environment variable:
   ```typescript
   const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://restaurant-inventory-api.onrender.com/api';
   ```

### Step 5: Test the Deployment

1. **Health Check**
   - Visit: `https://restaurant-inventory-api.onrender.com/health`
   - Should return: `{"success":true,"message":"Server is running"}`

2. **Test Login**
   - Use the frontend or Postman to test login endpoint
   - Default credentials (after seeding):
     - Admin: `admin@restaurant.com` / `admin123`
     - Manager: `manager@restaurant.com` / `manager123`
     - Staff: `staff@restaurant.com` / `staff123`

## Alternative Deployment Options

### Railway.app
- Similar to Render, free tier available
- Visit: [railway.app](https://railway.app)
- Process is similar to Render

### Fly.io
- Free tier available
- Visit: [fly.io](https://fly.io)
- Requires `flyctl` CLI installation

### DigitalOcean App Platform
- Paid service, but reliable
- Visit: [digitalocean.com](https://www.digitalocean.com)

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Check if IP is whitelisted in MongoDB Atlas
   - Verify connection string is correct
   - Ensure database user has proper permissions

2. **Build Fails**
   - Check Node.js version (Render uses Node 18+ by default)
   - Verify all dependencies are in `package.json`
   - Check build logs in Render dashboard

3. **Service Crashes**
   - Check logs in Render dashboard
   - Verify all environment variables are set
   - Ensure `MONGO_URI` is correct

4. **Slow Response Times**
   - Free tier on Render spins down after 15 minutes of inactivity
   - First request after spin-down takes ~30 seconds
   - Consider upgrading to paid tier for always-on service

## Notes

- **Free Tier Limitations**: 
  - Render free tier spins down after 15 min inactivity
  - First request after spin-down is slow (~30s)
  - Consider paid tier for production use

- **Security**:
  - Never commit `.env` file to Git
  - Use strong JWT secrets
  - Keep MongoDB credentials secure
  - Enable rate limiting (already configured)

- **Monitoring**:
  - Check Render logs regularly
  - Monitor MongoDB Atlas for connection issues
  - Set up alerts if needed

## Support

If you encounter issues:
1. Check Render deployment logs
2. Verify MongoDB Atlas connection
3. Test API endpoints with Postman/curl
4. Review error messages in logs

