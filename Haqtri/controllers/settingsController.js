const { Setting, Notification, UserPreferences, User } = require('../models');
const { sendEmail } = require('../utils/email');

// Get all settings for the authenticated user
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware

    // Fetch settings from respective tables
    const settings = await Setting.findOne({ where: { userId } });
    const notifications = await Notification.findOne({ where: { userId } });
    const preferences = await UserPreferences.findOne({ where: { userId } });

    // Default values if no records exist
    const response = {
      privacy: settings ? settings.privacy : 'Public',
      notifications: notifications ? { emailEnabled: notifications.emailEnabled } : { emailEnabled: true },
      preferences: preferences ? {
        preferred_languages: preferences.preferred_languages || 'English',
        specialty_interests: preferences.specialty_interests || ''
      } : {
        preferred_languages: 'English',
        specialty_interests: ''
      }
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update settings for the authenticated user
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { privacy, notifications, preferred_languages, specialty_interests } = req.body;

    // Validate input
    if (!privacy && !notifications && !preferred_languages && !specialty_interests) {
      return res.status(400).json({ message: 'No settings provided to update' });
    }

    // Update settings in respective tables
    if (privacy) {
      await Setting.upsert({ userId, privacy });
    }

    if (notifications && typeof notifications.emailEnabled !== 'undefined') {
      await Notification.upsert({ userId, emailEnabled: notifications.emailEnabled });
    }

    if (preferred_languages || specialty_interests) {
      await UserPreferences.upsert({
        userId,
        preferred_languages: preferred_languages || 'English',
        specialty_interests: specialty_interests || ''
      });
    }

    // Fetch user email for confirmation (optional)
    const user = await User.findByPk(userId);
    if (user && notifications?.emailEnabled) {
      await sendEmail(user.email, 'Settings Updated', 'Your haqtri settings have been successfully updated.');
    }

    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get notification preferences specifically (optional, for finer granularity)
const getNotificationPrefs = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await Notification.findOne({ where: { userId } });

    res.status(200).json({
      emailEnabled: notifications ? notifications.emailEnabled : true
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update notification preferences specifically (optional)
const updateNotificationPrefs = async (req, res) => {
  try {
    const userId = req.user.id;
    const { emailEnabled } = req.body;

    if (typeof emailEnabled !== 'boolean') {
      return res.status(400).json({ message: 'Invalid notification preference value' });
    }

    await Notification.upsert({ userId, emailEnabled });

    const user = await User.findByPk(userId);
    if (user && emailEnabled) {
      await sendEmail(user.email, 'Notification Preferences Updated', 'Your haqtri notification preferences have been updated.');
    }

    res.status(200).json({ message: 'Notification preferences updated successfully' });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset settings to default (optional utility)
const resetSettings = async (req, res) => {
  try {
    const userId = req.user.id;

    // Reset settings to defaults
    await Setting.destroy({ where: { userId } }); // Privacy resets to 'Public' on next fetch
    await Notification.destroy({ where: { userId } }); // Email enabled by default
    await UserPreferences.destroy({ where: { userId } }); // English language, no interests

    res.status(200).json({ message: 'Settings reset to defaults successfully' });
  } catch (error) {
    console.error('Error resetting settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getNotificationPrefs,
  updateNotificationPrefs,
  resetSettings,
};