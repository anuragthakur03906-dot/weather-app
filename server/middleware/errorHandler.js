/**
 * Global Error Handler Middleware
 * Catches and processes all errors thrown in the application
 * Provides consistent error response format
 */

/**
 * Error Handler Function
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} Formatted error response
 */
const errorHandler = (err, req, res, next) => {
  // Log full error stack for debugging
  console.error('Error Stack:', err.stack);
  
  // Determine status code (use err.status if set, otherwise 500)
  const statusCode = err.status || 500;
  
  // Prepare error response
  const errorResponse = {
    success: false,
    message: err.message || 'Internal server error',
  };
  
  // Include stack trace only in development environment
  // This helps with debugging without exposing internals in production
  if (process.env.NODE_ENV === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(statusCode).json(errorResponse);
};

module.exports = errorHandler;