const { verifyToken } = require('../utils/jwt');
const { User, Session } = require('../models');

/**
 * Middleware to authenticate requests using JWT
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'No token provided, authorization denied' });
    }

    const token = authHeader.replace('Bearer ', '');

    // Verify token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }

    // Check if user exists
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Optionally verify session (if using Session table for active sessions)
    const session = await Session.findOne({ where: { userId: user.user_id, token } });
    if (!session) {
      return res.status(401).json({ message: 'Session not found or invalid' });
    }

    // Attach user to request object
    req.user = { id: user.user_id, email: user.email, role_id: user.role_id };

    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.error('Error in authMiddleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Middleware to restrict access to specific roles
 * @param {Array} allowedRoles - Array of role_ids allowed to access the route
 */
const restrictToRoles = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Ensure authMiddleware has run first
      if (!req.user) {
        return res.status(401).json({ message: 'Authentication required' });
      }

      const userRole = req.user.role_id;

      // Check if user's role is in allowedRoles
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: 'You do not have permission to access this resource' });
      }

      next();
    } catch (error) {
      console.error('Error in restrictToRoles:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

/**
 * Middleware to check if email is verified
 */
const requireEmailVerification = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user.verified) {
      return res.status(403).json({ message: 'Email verification required to access this resource' });
    }

    next();
  } catch (error) {
    console.error('Error in requireEmailVerification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  authMiddleware,
  restrictToRoles,
  requireEmailVerification,
};