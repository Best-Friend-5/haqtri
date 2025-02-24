const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { 
  getSettings, 
  updateSettings, 
  getNotificationPrefs, 
  updateNotificationPrefs, 
  resetSettings 
} = require('../controllers/settingsController');

// Protected routes (require authentication)
// Get all settings for the authenticated user
router.get('/', authMiddleware, getSettings);

// Update settings for the authenticated user
router.put('/', authMiddleware, updateSettings);

// Get notification preferences specifically
router.get('/notifications', authMiddleware, getNotificationPrefs);

// Update notification preferences specifically
router.put('/notifications', authMiddleware, updateNotificationPrefs);

// Reset all settings to defaults
router.delete('/reset', authMiddleware, resetSettings);

module.exports = router;