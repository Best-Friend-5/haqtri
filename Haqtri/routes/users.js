// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\routes\users.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  getProfile, 
  updateProfile, 
  updatePassword, 
  getSettings, 
  updateSettings, 
  getBadges, 
  getSessions, 
  logoutSession, 
  deleteAccount 
} = require('../controllers/userController');
const { getStories } = require('../controllers/postController'); // From postController
const { getCurrentUser } = require('../controllers/authController'); // From authController

// Protected routes (require authentication)
// Get the authenticated user's basic info
router.get('/me', authMiddleware, getCurrentUser);

// Get the authenticated user's profile
router.get('/profile', authMiddleware, getProfile);

// Update the authenticated user's profile
router.put('/profile', authMiddleware, updateProfile);

// Update the authenticated user's password
router.put('/password', authMiddleware, updatePassword);

// Get the authenticated user's settings
router.get('/settings', authMiddleware, getSettings);

// Update the authenticated user's settings
router.put('/settings', authMiddleware, updateSettings);

// Get the authenticated user's badges
router.get('/badges', authMiddleware, getBadges);

// Get the authenticated user's active sessions
router.get('/sessions', authMiddleware, getSessions);

// Logout from a specific session
router.delete('/sessions/:sessionId', authMiddleware, logoutSession);

// Delete the authenticated user's account
router.delete('/account', authMiddleware, deleteAccount);

// Get user stories (from postController)
router.get('/stories', authMiddleware, getStories);

module.exports = router;