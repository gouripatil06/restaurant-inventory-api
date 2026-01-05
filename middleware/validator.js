const { body, validationResult } = require('express-validator');

/**
 * Validation Result Handler
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }
  next();
};

/**
 * User Registration Validation Rules
 */
exports.validateRegister = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['admin', 'manager', 'staff'])
    .withMessage('Invalid role'),
  handleValidationErrors,
];

/**
 * User Login Validation Rules
 */
exports.validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  handleValidationErrors,
];

/**
 * Inventory Creation/Update Validation Rules
 */
exports.validateInventory = [
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Item name must be between 2 and 100 characters'),
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Grains', 'Vegetables', 'Dairy', 'Beverages', 'Spices', 'Meat', 'Fruits'])
    .withMessage('Invalid category'),
  body('quantityAvailable')
    .notEmpty()
    .withMessage('Quantity is required')
    .isFloat({ min: 0 })
    .withMessage('Quantity must be a positive number'),
  body('unit')
    .notEmpty()
    .withMessage('Unit is required')
    .isIn(['kg', 'liters', 'packets', 'pieces', 'boxes'])
    .withMessage('Invalid unit'),
  body('reorderLevel')
    .notEmpty()
    .withMessage('Reorder level is required')
    .isFloat({ min: 0 })
    .withMessage('Reorder level must be a positive number'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  handleValidationErrors,
];

/**
 * Inventory Update Usage Validation Rules
 */
exports.validateUpdateUsage = [
  body('itemName')
    .trim()
    .notEmpty()
    .withMessage('Item name is required'),
  body('quantityUsed')
    .notEmpty()
    .withMessage('Quantity used is required')
    .isFloat({ min: 0 })
    .withMessage('Quantity used must be a positive number'),
  handleValidationErrors,
];

