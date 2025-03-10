// server/controllers/userController.js
const { User, WorkerProfiles, AgentProfiles, ArchitectProfiles, Setting, Notification, Session, UserPreferences, WorkerBadges, Badges } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');

// Get user profile (including role-specific details)
const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      attributes: [
        'user_id', 'title', 'first_name', 'last_name', 'middle_name', 'other_names', 'business_name',
        'email', 'phone_country_code', 'phone', 'alt_phone_country_code', 'alt_phone',
        'verified', 'verification_status', 'bvn', 'national_id', 'registered_at', 'last_login_at',
        'address_line1', 'address_line2', 'city', 'state_province_region', 'country_code', 'postal_code',
        'date_of_birth', 'gender', 'nationality', 'preferred_language', 'profile_picture_url', 'bio',
        'timezone', 'currency_code'
      ],
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
    const {
      title, first_name, last_name, middle_name, other_names, business_name,
      email, phone_country_code, phone, alt_phone_country_code, alt_phone,
      address_line1, address_line2, city, state_province_region, country_code, postal_code,
      date_of_birth, gender, nationality, profile_picture_url, bio
    } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    await user.update({
      title: title || user.title,
      first_name: first_name || user.first_name,
      last_name: last_name || user.last_name,
      middle_name: middle_name || user.middle_name,
      other_names: other_names || user.other_names,
      business_name: business_name || user.business_name,
      email: email || user.email,
      phone_country_code: phone_country_code || user.phone_country_code,
      phone: phone || user.phone,
      alt_phone_country_code: alt_phone_country_code || user.alt_phone_country_code,
      alt_phone: alt_phone || user.alt_phone,
      address_line1: address_line1 || user.address_line1,
      address_line2: address_line2 || user.address_line2,
      city: city || user.city,
      state_province_region: state_province_region || user.state_province_region,
      country_code: country_code || user.country_code,
      postal_code: postal_code || user.postal_code,
      date_of_birth: date_of_birth || user.date_of_birth,
      gender: gender || user.gender,
      nationality: nationality || user.nationality,
      profile_picture_url: profile_picture_url || user.profile_picture_url,
      bio: bio || user.bio,
    });

    res.status(200).json({ message: 'Profile updated successfully', user });
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
    await user.update({ 
      password_hash: hashedPassword,
      last_login_at: new Date() // Track password change as activity
    });

    await sendEmail(user.email, 'Password Updated', 'Your Haqtri password has been updated.');
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
    const user = await User.findByPk(userId, {
      attributes: ['preferred_language', 'timezone', 'currency_code']
    });
    const settings = await Setting.findOne({ where: { userId } });
    const notifications = await Notification.findOne({ where: { userId } });

    res.status(200).json({
      settings: settings || { privacy: 'Public', notifications: {} },
      notifications: notifications || { emailEnabled: true },
      preferences: {
        preferred_language: user.preferred_language || 'en',
        timezone: user.timezone || 'Africa/Lagos',
        currency_code: user.currency_code || 'NGN'
      },
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
    const { privacy, notifications, preferred_language, timezone, currency_code } = req.body;

    const user = await User.findByPk(userId);
    await user.update({
      preferred_language: preferred_language || user.preferred_language,
      timezone: timezone || user.timezone,
      currency_code: currency_code || user.currency_code,
    });

    await Setting.upsert({ userId, privacy, notifications });
    await Notification.upsert({ userId, emailEnabled: notifications?.emailEnabled });

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

    // Optional: Add verification-based badge
    const user = await User.findByPk(userId);
    if (user.verified) {
      badges.push({ badge_name: 'Verified User', criteria: 'Identity verified' });
    }

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
    const sessions = await Session.findAll({ 
      where: { userId },
      attributes: ['id', 'created_at', 'last_active_at'] // Adjust based on Session model
    });
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

    await user.update({ account_status: 'deleted' }); // Soft delete
    await Session.destroy({ where: { userId } }); // Clear sessions
    res.status(200).json({ message: 'Account marked as deleted' });
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