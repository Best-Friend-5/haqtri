const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  signup, 
  login, 
  logout, 
  requestPasswordReset, 
  resetPassword, 
  verifyEmail 
} = require('../controllers/authController');

// Public routes (no authentication required)
// User signup
router.post('/signup', signup);

// User login
router.post('/login', login);

// Request password reset
router.post('/password/reset', requestPasswordReset);

// Reset password with token
router.post('/password/reset/confirm', resetPassword);

// Verify email with token
router.get('/verify-email', verifyEmail);

// Protected routes (require authentication)
// Logout from a specific session
router.delete('/logout/:sessionId', authMiddleware, logout);

module.exports = router;