const Inventory = require('../models/InventorySchema');
const InventoryHistory = require('../models/InventoryHistory');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/errorHandler');
const { sendSuccess, sendPaginatedResponse } = require('../utils/responseHandler');
const { PAGINATION } = require('../config/constants');

/**
 * @desc    Get all inventory items
 * @route   GET /api/inventory
 * @access  Private
 */
exports.getAllInventory = asyncHandler(async (req, res, next) => {
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    category,
    stockStatus,
    search,
    sortBy = 'itemName',
    sortOrder = 'asc',
  } = req.query;

  // Build query
  const query = {};

  if (category) {
    query.category = category;
  }

  if (stockStatus) {
    query.stockStatus = stockStatus;
  }

  if (search) {
    query.$or = [
      { itemName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Pagination
  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  // Sort
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const [items, total] = await Promise.all([
    Inventory.find(query)
      .populate('lastUpdatedBy', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    Inventory.countDocuments(query),
  ]);

  sendPaginatedResponse(
    res,
    200,
    'Inventory items retrieved successfully',
    items,
    {
      page: pageNum,
      limit: limitNum,
      total,
    }
  );
});

/**
 * @desc    Get single inventory item
 * @route   GET /api/inventory/:id
 * @access  Private
 */
exports.getInventoryItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const item = await Inventory.findById(id).populate('lastUpdatedBy', 'name email');

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  sendSuccess(res, 200, 'Inventory item retrieved successfully', item);
});

/**
 * @desc    Create new inventory item
 * @route   POST /api/inventory
 * @access  Private (Admin/Manager only)
 */
exports.createInventoryItem = asyncHandler(async (req, res, next) => {
  const {
    itemName,
    category,
    quantityAvailable,
    unit,
    reorderLevel,
    description,
    supplier,
    costPerUnit,
    location,
  } = req.body;

  // Check if item already exists
  const existingItem = await Inventory.findOne({ itemName });
  if (existingItem) {
    return next(new AppError('Item with this name already exists', 400));
  }

  // Create inventory item
  const item = await Inventory.create({
    itemName,
    category,
    quantityAvailable: quantityAvailable || 0,
    unit,
    reorderLevel,
    description,
    supplier,
    costPerUnit,
    location,
    lastUpdatedBy: req.user.id,
  });

  // Create history entry
  await InventoryHistory.create({
    inventoryItem: item._id,
    itemName: item.itemName,
    transactionType: 'create',
    quantityBefore: 0,
    quantityChange: quantityAvailable || 0,
    quantityAfter: quantityAvailable || 0,
    unit: item.unit,
    reason: 'Initial stock',
    performedBy: req.user.id,
    performedByName: req.user.name,
  });

  sendSuccess(res, 201, 'Inventory item created successfully', item);
});

/**
 * @desc    Update inventory item
 * @route   PUT /api/inventory/:id
 * @access  Private (Admin/Manager only)
 */
exports.updateInventoryItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const updateData = req.body;

  const item = await Inventory.findById(id);

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  // Store old quantity for history
  const oldQuantity = item.quantityAvailable;

  // Update item
  Object.keys(updateData).forEach((key) => {
    if (key !== 'quantityAvailable') {
      item[key] = updateData[key];
    }
  });

  // Handle quantity update separately to trigger stock status update
  if (updateData.quantityAvailable !== undefined) {
    item.quantityAvailable = updateData.quantityAvailable;
  }

  item.lastUpdatedBy = req.user.id;
  item.updateStockStatus();
  await item.save();

  // Create history entry if quantity changed
  if (updateData.quantityAvailable !== undefined && updateData.quantityAvailable !== oldQuantity) {
    await InventoryHistory.create({
      inventoryItem: item._id,
      itemName: item.itemName,
      transactionType: 'adjustment',
      quantityBefore: oldQuantity,
      quantityChange: updateData.quantityAvailable - oldQuantity,
      quantityAfter: item.quantityAvailable,
      unit: item.unit,
      reason: updateData.reason || 'Manual adjustment',
      performedBy: req.user.id,
      performedByName: req.user.name,
    });
  }

  sendSuccess(res, 200, 'Inventory item updated successfully', item);
});

/**
 * @desc    Update inventory usage (deduct quantity)
 * @route   POST /api/inventory/update-usage
 * @access  Private
 */
exports.updateInventoryUsage = asyncHandler(async (req, res, next) => {
  const { itemName, quantityUsed, reason } = req.body;

  if (!itemName || quantityUsed === undefined) {
    return next(new AppError('Item name and quantity used are required', 400));
  }

  if (quantityUsed < 0) {
    return next(new AppError('Quantity used cannot be negative', 400));
  }

  // Find item
  const item = await Inventory.findOne({ itemName });

  if (!item) {
    return next(new AppError(`Inventory item "${itemName}" not found`, 404));
  }

  // Store old quantity
  const quantityBefore = item.quantityAvailable;

  // Calculate new quantity
  const quantityAfter = Math.max(0, quantityBefore - quantityUsed);

  // Update item
  item.quantityAvailable = quantityAfter;
  item.lastUpdatedBy = req.user.id;
  item.updateStockStatus();
  await item.save();

  // Create history entry
  await InventoryHistory.create({
    inventoryItem: item._id,
    itemName: item.itemName,
    transactionType: 'usage',
    quantityBefore,
    quantityChange: -quantityUsed,
    quantityAfter,
    unit: item.unit,
    reason: reason || 'Stock usage',
    performedBy: req.user.id,
    performedByName: req.user.name,
  });

  sendSuccess(res, 200, 'Inventory usage updated successfully', {
    itemName: item.itemName,
    quantityBefore,
    quantityUsed,
    quantityAfter,
    stockStatus: item.stockStatus,
    lastUpdated: item.lastUpdated,
  });
});

/**
 * @desc    Restock inventory item
 * @route   POST /api/inventory/restock
 * @access  Private (Admin/Manager only)
 */
exports.restockInventory = asyncHandler(async (req, res, next) => {
  const { itemName, quantityAdded, reason } = req.body;

  if (!itemName || quantityAdded === undefined) {
    return next(new AppError('Item name and quantity added are required', 400));
  }

  if (quantityAdded <= 0) {
    return next(new AppError('Quantity added must be positive', 400));
  }

  // Find item
  const item = await Inventory.findOne({ itemName });

  if (!item) {
    return next(new AppError(`Inventory item "${itemName}" not found`, 404));
  }

  // Store old quantity
  const quantityBefore = item.quantityAvailable;

  // Update quantity
  item.quantityAvailable += quantityAdded;
  item.lastUpdatedBy = req.user.id;
  item.updateStockStatus();
  await item.save();

  // Create history entry
  await InventoryHistory.create({
    inventoryItem: item._id,
    itemName: item.itemName,
    transactionType: 'restock',
    quantityBefore,
    quantityChange: quantityAdded,
    quantityAfter: item.quantityAvailable,
    unit: item.unit,
    reason: reason || 'Stock restocked',
    performedBy: req.user.id,
    performedByName: req.user.name,
  });

  sendSuccess(res, 200, 'Inventory restocked successfully', {
    itemName: item.itemName,
    quantityBefore,
    quantityAdded,
    quantityAfter: item.quantityAvailable,
    stockStatus: item.stockStatus,
  });
});

/**
 * @desc    Delete inventory item
 * @route   DELETE /api/inventory/:id
 * @access  Private (Admin only)
 */
exports.deleteInventoryItem = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const item = await Inventory.findById(id);

  if (!item) {
    return next(new AppError('Inventory item not found', 404));
  }

  // Create history entry before deletion
  await InventoryHistory.create({
    inventoryItem: item._id,
    itemName: item.itemName,
    transactionType: 'delete',
    quantityBefore: item.quantityAvailable,
    quantityChange: -item.quantityAvailable,
    quantityAfter: 0,
    unit: item.unit,
    reason: 'Item deleted',
    performedBy: req.user.id,
    performedByName: req.user.name,
  });

  await Inventory.findByIdAndDelete(id);

  sendSuccess(res, 200, 'Inventory item deleted successfully');
});

/**
 * @desc    Get low stock items
 * @route   GET /api/inventory/low-stock
 * @access  Private
 */
exports.getLowStockItems = asyncHandler(async (req, res, next) => {
  const items = await Inventory.findLowStock().populate('lastUpdatedBy', 'name email');

  sendSuccess(res, 200, 'Low stock items retrieved successfully', items);
});

/**
 * @desc    Get inventory statistics
 * @route   GET /api/inventory/statistics
 * @access  Private
 */
exports.getInventoryStatistics = asyncHandler(async (req, res, next) => {
  const [
    totalItems,
    availableItems,
    lowStockItems,
    outOfStockItems,
    itemsByCategory,
    totalValue,
  ] = await Promise.all([
    Inventory.countDocuments(),
    Inventory.countDocuments({ stockStatus: 'Available' }),
    Inventory.countDocuments({ stockStatus: 'Low Stock' }),
    Inventory.countDocuments({ stockStatus: 'Out of Stock' }),
    Inventory.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
        },
      },
    ]),
    Inventory.aggregate([
      {
        $project: {
          value: { $multiply: ['$quantityAvailable', { $ifNull: ['$costPerUnit', 0] }] },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$value' },
        },
      },
    ]),
  ]);

  sendSuccess(res, 200, 'Statistics retrieved successfully', {
    overview: {
      totalItems,
      availableItems,
      lowStockItems,
      outOfStockItems,
    },
    byCategory: itemsByCategory,
    totalInventoryValue: totalValue[0]?.total || 0,
  });
});

/**
 * @desc    Get inventory history
 * @route   GET /api/inventory/history/:itemId
 * @access  Private
 */
exports.getInventoryHistory = asyncHandler(async (req, res, next) => {
  const { itemId } = req.params;
  const {
    page = PAGINATION.DEFAULT_PAGE,
    limit = PAGINATION.DEFAULT_LIMIT,
    transactionType,
  } = req.query;

  const query = { inventoryItem: itemId };
  if (transactionType) {
    query.transactionType = transactionType;
  }

  const pageNum = parseInt(page);
  const limitNum = Math.min(parseInt(limit), PAGINATION.MAX_LIMIT);
  const skip = (pageNum - 1) * limitNum;

  const [history, total] = await Promise.all([
    InventoryHistory.find(query)
      .populate('performedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    InventoryHistory.countDocuments(query),
  ]);

  sendPaginatedResponse(
    res,
    200,
    'Inventory history retrieved successfully',
    history,
    {
      page: pageNum,
      limit: limitNum,
      total,
    }
  );
});

