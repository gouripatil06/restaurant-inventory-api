const mongoose = require('mongoose');

/**
 * Inventory History Schema
 * Tracks all inventory changes and transactions
 */
const inventoryHistorySchema = new mongoose.Schema(
  {
    inventoryItem: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Inventory',
      required: true,
      index: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    transactionType: {
      type: String,
      enum: ['usage', 'restock', 'adjustment', 'delete', 'create'],
      required: true,
    },
    quantityBefore: {
      type: Number,
      required: true,
    },
    quantityChange: {
      type: Number,
      required: true,
    },
    quantityAfter: {
      type: Number,
      required: true,
    },
    unit: {
      type: String,
      required: true,
    },
    reason: {
      type: String,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    performedByName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
inventoryHistorySchema.index({ inventoryItem: 1, createdAt: -1 });
inventoryHistorySchema.index({ performedBy: 1, createdAt: -1 });
inventoryHistorySchema.index({ transactionType: 1, createdAt: -1 });

const InventoryHistory = mongoose.model('InventoryHistory', inventoryHistorySchema);

module.exports = InventoryHistory;

