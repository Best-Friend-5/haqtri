const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/config');

/**
 * Generate a JWT token
 * @param {number} userId - The user's ID to include in the token payload
 * @param {Object} [options] - Optional JWT options (e.g., expiresIn)
 * @returns {string} - The generated JWT token
 */
const generateToken = (userId, options = {}) => {
  try {
    if (!userId || typeof userId !== 'number') {
      throw new Error('User ID must be a valid number');
    }

    const payload = { id: userId };
    const defaultOptions = { expiresIn: '1h' }; // Default expiration: 1 hour
    const tokenOptions = { ...defaultOptions, ...options };

    const token = jwt.sign(payload, jwtSecret, tokenOptions);
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error.message);
    throw error; // Re-throw for controller-level handling
  }
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {Object} - The decoded payload if valid
 */
const verifyToken = (token) => {
  try {
    if (!token || typeof token !== 'string') {
      throw new Error('Token must be a non-empty string');
    }

    const decoded = jwt.verify(token, jwtSecret);
    return decoded;
  } catch (error) {
    console.error('Error verifying JWT token:', error.message);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw error; // Re-throw specific JWT errors for middleware handling
    }
    throw new Error('Invalid token'); // Generic error for other cases
  }
};

/**
 * Refresh a JWT token (optional utility)
 * @param {string} token - The existing token to refresh
 * @returns {string} - A new JWT token with extended expiration
 */
const refreshToken = (token) => {
  try {
    const decoded = verifyToken(token); // Verify existing token
    const userId = decoded.id;

    // Generate a new token with default expiration
    const newToken = generateToken(userId);
    return newToken;
  } catch (error) {
    console.error('Error refreshing JWT token:', error.message);
    throw error; // Re-throw for controller-level handling
  }
};

module.exports = {
  generateToken,
  verifyToken,
  refreshToken,
};