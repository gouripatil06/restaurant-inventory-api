const rateLimit = require('express-rate-limit');

/**
 * General API Rate Limiter
 * Limits requests from same IP
 */
exports.apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Auth Rate Limiter
 * Stricter limits for authentication endpoints
 */
exports.authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login requests per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes.',
  },
  skipSuccessfulRequests: true,
});

/**
 * Update Inventory Rate Limiter
 * Limits inventory update requests
 */
exports.updateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 update requests per minute
  message: {
    success: false,
    message: 'Too many update requests, please slow down.',
  },
});

