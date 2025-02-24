/**
 * Centralized error handling middleware for Express
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
    // Log the error with details
    console.error({
      message: err.message,
      stack: err.stack,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });
  
    // Handle specific error types
    switch (true) {
      // Sequelize validation errors
      case err.name === 'SequelizeValidationError':
        return res.status(400).json({
          message: 'Validation error',
          errors: err.errors.map((e) => ({
            field: e.path,
            message: e.message,
          })),
        });
  
      // Sequelize unique constraint errors
      case err.name === 'SequelizeUniqueConstraintError':
        return res.status(400).json({
          message: 'Duplicate entry',
          errors: err.errors.map((e) => ({
            field: e.path,
            value: e.value,
            message: `${e.path} must be unique`,
          })),
        });
  
      // Sequelize database errors (e.g., connection issues)
      case err.name === 'SequelizeDatabaseError':
        return res.status(500).json({
          message: 'Database error occurred',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined,
        });
  
      // JWT authentication errors
      case err.name === 'JsonWebTokenError':
        return res.status(401).json({
          message: 'Invalid token',
        });
  
      case err.name === 'TokenExpiredError':
        return res.status(401).json({
          message: 'Token has expired',
        });
  
      // Custom errors (you can throw these in controllers)
      case err.message === 'NotFound':
        return res.status(404).json({
          message: `${err.resource || 'Resource'} not found`,
        });
  
      case err.message === 'Unauthorized':
        return res.status(401).json({
          message: 'Unauthorized access',
        });
  
      case err.message === 'Forbidden':
        return res.status(403).json({
          message: 'You do not have permission to perform this action',
        });
  
      // Default unhandled errors
      default:
        return res.status(500).json({
          message: 'Internal server error',
          error: process.env.NODE_ENV === 'development' ? err.message : undefined, // Show error details only in development
        });
    }
  };
  
  /**
   * Helper to throw custom errors
   * @param {string} message - Error message
   * @param {string} resource - Optional resource name for NotFound errors
   */
  const throwError = (message, resource = null) => {
    const error = new Error(message);
    if (resource) error.resource = resource;
    throw error;
  };
  
  module.exports = {
    errorHandler,
    throwError, // Optional export for use in controllers
  };