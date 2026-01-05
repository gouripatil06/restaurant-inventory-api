const mongoose = require('mongoose');
const { STOCK_STATUS, CATEGORIES, UNITS } = require('../config/constants');

/**
 * Enhanced Inventory Item Schema
 * Stores all inventory items with comprehensive details
 */
const inventorySchema = new mongoose.Schema(
  {
    itemName: {
      type: String,
      required: [true, 'Item name is required'],
      trim: true,
      unique: true,
      index: true,
    },
    category: {
      type: String,
      enum: Object.values(CATEGORIES),
      required: [true, 'Category is required'],
      index: true,
    },
    quantityAvailable: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    unit: {
      type: String,
      enum: Object.values(UNITS),
      required: [true, 'Unit of measurement is required'],
    },
    reorderLevel: {
      type: Number,
      required: [true, 'Reorder level is required'],
      min: [0, 'Reorder level cannot be negative'],
      default: 0,
    },
    stockStatus: {
      type: String,
      enum: Object.values(STOCK_STATUS),
      default: STOCK_STATUS.AVAILABLE,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    supplier: {
      type: String,
      trim: true,
    },
    costPerUnit: {
      type: Number,
      min: [0, 'Cost cannot be negative'],
    },
    location: {
      type: String,
      trim: true,
      default: 'Main Storage',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
inventorySchema.index({ category: 1, stockStatus: 1 });
inventorySchema.index({ itemName: 'text' }); // Text search index

// Virtual for checking if item needs reorder
inventorySchema.virtual('needsReorder').get(function () {
  return this.quantityAvailable <= this.reorderLevel;
});

// Method to update stock status based on quantity
inventorySchema.methods.updateStockStatus = function () {
  if (this.quantityAvailable === 0) {
    this.stockStatus = STOCK_STATUS.OUT_OF_STOCK;
  } else if (this.quantityAvailable <= this.reorderLevel) {
    this.stockStatus = STOCK_STATUS.LOW_STOCK;
  } else {
    this.stockStatus = STOCK_STATUS.AVAILABLE;
  }
  this.lastUpdated = new Date();
  return this;
};

// Pre-save hook to update stock status
inventorySchema.pre('save', function (next) {
  this.updateStockStatus();
  next();
});

// Static method to find low stock items
inventorySchema.statics.findLowStock = function () {
  return this.find({
    $or: [
      { stockStatus: STOCK_STATUS.LOW_STOCK },
      { stockStatus: STOCK_STATUS.OUT_OF_STOCK },
    ],
  });
};

// Static method to find items by category
inventorySchema.statics.findByCategory = function (category) {
  return this.find({ category });
};

const Inventory = mongoose.model('Inventory', inventorySchema);

module.exports = Inventory;
