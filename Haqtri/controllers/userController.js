const { User, WorkerProfiles, AgentProfiles, ArchitectProfiles, Setting, Notification, Session, UserPreferences, WorkerBadges, Badges } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');

// Get user profile (including role-specific details)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const user = await User.findByPk(userId, {
      attributes: ['user_id', 'email', 'phone', 'name', 'verified', 'registered_at'],
      include: [
        { model: WorkerProfiles, attributes: ['bio', 'hourly_rate', 'specialization_id'] },
        { model: AgentProfiles, attributes: ['agency_name', 'licensed'] },
        { model: ArchitectProfiles, attributes: ['registration_number'] },
      ],
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, phone } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      name: name || user.name,
      email: email || user.email,
      phone: phone || user.phone,
    });

    res.status(200).json({ message: 'Profile updated successfully', user: { name, email, phone } });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update password
const updatePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'New passwords do not match' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password_hash: hashedPassword });

    // Send confirmation email (optional)
    await sendEmail(user.email, 'Password Updated', 'Your haqtri password has been successfully updated.');

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Error updating password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user settings
const getSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await Setting.findOne({ where: { userId } });
    const notifications = await Notification.findOne({ where: { userId } });
    const preferences = await UserPreferences.findOne({ where: { userId } });

    res.status(200).json({
      settings: settings || { privacy: 'Public', notifications: {} },
      notifications: notifications || { emailEnabled: true },
      preferences: preferences || { preferred_languages: 'English', specialty_interests: '' },
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update user settings
const updateSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const { privacy, notifications, preferred_languages, specialty_interests } = req.body;

    await Setting.upsert({ userId, privacy, notifications });
    await Notification.upsert({ userId, emailEnabled: notifications?.email });
    await UserPreferences.upsert({ userId, preferred_languages, specialty_interests });

    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get user badges
const getBadges = async (req, res) => {
  try {
    const userId = req.user.id;
    const badges = await WorkerBadges.findAll({
      where: { worker_id: userId },
      include: [{ model: Badges, attributes: ['badge_name', 'criteria'] }],
    });

    res.status(200).json(badges);
  } catch (error) {
    console.error('Error fetching badges:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Manage active sessions
const getSessions = async (req, res) => {
  try {
    const userId = req.user.id;
    const sessions = await Session.findAll({ where: { userId } });
    res.status(200).json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const logoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const session = await Session.findOne({ where: { userId, id: sessionId } });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.destroy();
    res.status(200).json({ message: 'Session logged out successfully' });
  } catch (error) {
    console.error('Error logging out session:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete user account
const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Delete related data (cascade deletes assumed in DB schema)
    await user.destroy();
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getProfile,
  updateProfile,
  updatePassword,
  getSettings,
  updateSettings,
  getBadges,
  getSessions,
  logoutSession,
  deleteAccount,
};