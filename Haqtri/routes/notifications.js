const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  getNotificationPrefs, 
  updateNotificationPrefs 
} = require('../controllers/settingsController');

// Protected routes (require authentication)
// Get notification preferences for the authenticated user
router.get('/prefs', authMiddleware, getNotificationPrefs);

// Update notification preferences for the authenticated user
router.put('/prefs', authMiddleware, updateNotificationPrefs);

module.exports = router;