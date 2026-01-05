const express = require('express');
const {
  getAllInventory,
  getInventoryItem,
  createInventoryItem,
  updateInventoryItem,
  updateInventoryUsage,
  restockInventory,
  deleteInventoryItem,
  getLowStockItems,
  getInventoryStatistics,
  getInventoryHistory,
} = require('../controllers/inventoryController');
const { protect, authorize } = require('../middleware/auth');
const { updateLimiter } = require('../middleware/rateLimiter');
const {
  validateInventory,
  validateUpdateUsage,
} = require('../middleware/validator');

const router = express.Router();

// All routes are protected
router.use(protect);

// Public inventory routes (for all authenticated users)
router.get('/', getAllInventory);
router.get('/low-stock', getLowStockItems);
router.get('/statistics', getInventoryStatistics);
router.get('/history/:itemId', getInventoryHistory);
router.get('/:id', getInventoryItem);
router.post('/update-usage', updateLimiter, validateUpdateUsage, updateInventoryUsage);

// Admin/Manager only routes
router.post('/', authorize('admin', 'manager'), validateInventory, createInventoryItem);
router.put('/:id', authorize('admin', 'manager'), validateInventory, updateInventoryItem);
router.post('/restock', authorize('admin', 'manager'), restockInventory);

// Admin only routes
router.delete('/:id', authorize('admin'), deleteInventoryItem);

module.exports = router;

