/**
 * Application Constants
 * Centralized configuration values
 */

module.exports = {
  // Stock Status Types
  STOCK_STATUS: {
    AVAILABLE: 'Available',
    LOW_STOCK: 'Low Stock',
    OUT_OF_STOCK: 'Out of Stock',
  },

  // Categories
  CATEGORIES: {
    GRAINS: 'Grains',
    VEGETABLES: 'Vegetables',
    DAIRY: 'Dairy',
    BEVERAGES: 'Beverages',
    SPICES: 'Spices',
    MEAT: 'Meat',
    FRUITS: 'Fruits',
  },

  // Units of Measurement
  UNITS: {
    KG: 'kg',
    LITERS: 'liters',
    PACKETS: 'packets',
    PIECES: 'pieces',
    BOXES: 'boxes',
  },

  // User Roles
  USER_ROLES: {
    ADMIN: 'admin',
    MANAGER: 'manager',
    STAFF: 'staff',
  },

  // JWT Token Expiry
  JWT_EXPIRY: {
    ACCESS_TOKEN: '24h',
    REFRESH_TOKEN: '7d',
  },

  // Pagination
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
  },
};

