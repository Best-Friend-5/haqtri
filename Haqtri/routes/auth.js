// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\routes\auth.js
const express = require('express');
const router = express.Router();
const passport = require('passport');
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  signup, 
  login, 
  logout, 
  requestPasswordReset, 
  resetPassword, 
  verifyEmail, 
  submitVerification,
  getCurrentUser // Add this
} = require('../controllers/authController');

// Public routes (no authentication required)
router.post('/signup', signup);
router.post('/login', login);

// Google OAuth Route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth Callback
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  async (req, res) => {
    console.log('Google OAuth callback received for user:', req.user.email);
    await req.user.update({ last_login_at: new Date() });
    const token = require('../utils/jwt').generateToken(req.user.user_id);
    console.log('Google OAuth successful, redirecting with token for:', req.user.email);
    res.redirect(`http://localhost:3000/home?token=${token}`);
  }
);

// Existing public routes
router.post('/password/reset', requestPasswordReset);
router.post('/password/reset/confirm', resetPassword);
router.get('/verify-email', verifyEmail);

// Protected routes (require authentication)
router.delete('/logout/:sessionId', authMiddleware, logout);
router.post('/submit-verification', authMiddleware, submitVerification);
router.get('/users/me', authMiddleware, getCurrentUser); // Add this route

module.exports = router;