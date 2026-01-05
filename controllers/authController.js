const User = require('../models/User');
const { asyncHandler } = require('../utils/asyncHandler');
const { AppError } = require('../utils/errorHandler');
const { sendSuccess } = require('../utils/responseHandler');

/**
 * @desc    Register new user
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError('User with this email already exists', 400));
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'staff',
  });

  // Generate token
  const token = user.generateToken();

  sendSuccess(res, 201, 'User registered successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
  });
});

/**
 * @desc    Login user
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(new AppError('Please provide email and password', 400));
  }

  // Check for user and include password
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError('Invalid credentials', 401));
  }

  if (!user.isActive) {
    return next(new AppError('Account is deactivated', 403));
  }

  // Update last login
  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  // Generate token
  const token = user.generateToken();
  const refreshToken = user.generateRefreshToken();

  sendSuccess(res, 200, 'Login successful', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    token,
    refreshToken,
  });
});

/**
 * @desc    Get current user
 * @route   GET /api/auth/me
 * @access  Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  sendSuccess(res, 200, 'User retrieved successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt,
    },
  });
});

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/update-profile
 * @access  Private
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  const { name, email } = req.body;
  const userId = req.user.id;

  // Check if email is being changed and if it's already taken
  if (email) {
    const existingUser = await User.findOne({ email, _id: { $ne: userId } });
    if (existingUser) {
      return next(new AppError('Email already in use', 400));
    }
  }

  const user = await User.findByIdAndUpdate(
    userId,
    { name, email },
    { new: true, runValidators: true }
  );

  sendSuccess(res, 200, 'Profile updated successfully', {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

/**
 * @desc    Change password
 * @route   PUT /api/auth/change-password
 * @access  Private
 */
exports.changePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  // Check current password
  if (!(await user.comparePassword(currentPassword))) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  user.password = newPassword;
  await user.save();

  sendSuccess(res, 200, 'Password changed successfully');
});

