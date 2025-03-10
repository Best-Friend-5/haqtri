// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\controllers\authController.js
const { User, Session } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken, verifyToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');

// Signup a new user (basic details only)
const signup = async (req, res) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !password) {
      return res.status(400).json({ message: 'First name, last name, email, and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password and create user with basic details
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      first_name,
      last_name,
      email,
      password_hash: hashedPassword,
      verified: false,
      verification_status: 'pending',
      country_code: 'NG', // Nigeria default
      timezone: 'Africa/Lagos',
      currency_code: 'NGN',
      registered_at: new Date(),
      account_status: 'active',
    });

    // Generate JWT token
    const token = generateToken(user.user_id);

    // Bypassing email sending for now
    // const verifyLink = `http://localhost:5001/api/auth/verify-email?token=${token}`;
    // await sendEmail(email, 'Welcome to Haqtri', `Thank you for joining Haqtri! Verify your email: ${verifyLink}. Add verification documents in your profile to unlock full features.`);

    res.status(201).json({ message: 'User created successfully', token });
  } catch (error) {
    console.error('Error during signup:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Login an existing user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || user.account_status === 'deleted') {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    await user.update({ last_login_at: new Date() });
    const token = generateToken(user.user_id);

    const session = await Session.create({
      userId: user.user_id,
      device: req.headers['user-agent'] || 'Unknown Device',
      token,
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      sessionId: session.id,
      user: {
        first_name: user.first_name,
        last_name: user.last_name,
        verified: user.verified,
        country_code: user.country_code,
      },
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout a user from a specific session
const logout = async (req, res) => {
  try {
    const userId = req.user.id;
    const { sessionId } = req.params;

    const session = await Session.findOne({ where: { userId, id: sessionId } });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await session.destroy();
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error during logout:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Request password reset
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ where: { email } });
    if (!user || user.account_status === 'deleted') {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generateToken(user.user_id, { expiresIn: '1h' });
    // Bypassing email sending for now
    // const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`;
    // await sendEmail(email, 'Password Reset Request', `Click here to reset your password: ${resetLink}`);

    res.status(200).json({ message: 'Password reset link would have been sent (bypassed)', resetToken });
  } catch (error) {
    console.error('Error requesting password reset:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Reset password using token
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword, confirmPassword } = req.body;

    if (!token || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.account_status === 'deleted') {
      return res.status(404).json({ message: 'User not found' });
    }

    const hashedPassword = await hashPassword(newPassword);
    await user.update({
      password_hash: hashedPassword,
      last_login_at: null,
    });

    await Session.destroy({ where: { userId: user.user_id } });
    // Bypassing email sending for now
    // await sendEmail(user.email, 'Password Reset Successful', 'Your Haqtri password has been reset successfully.');

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify email
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user || user.account_status === 'deleted') {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    await user.update({
      verified: true,
      verification_status: 'verified',
      verification_date: new Date(),
      verification_method: 'email',
    });

    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Submit verification documents (post-signup)
const submitVerification = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
    const { bvn, national_id } = req.body;

    if (!bvn && !national_id) {
      return res.status(400).json({ message: 'At least one verification document (BVN or National ID) is required' });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verification_status === 'verified') {
      return res.status(400).json({ message: 'User already verified' });
    }

    await user.update({
      bvn: bvn || user.bvn,
      national_id: national_id || user.national_id,
      verification_status: 'pending', // Reset to pending for review
      verification_method: bvn ? 'bvn' : 'national_id',
    });

    // Bypassing email sending for now
    // await sendEmail('admin@haqtri.com', 'New Verification Submission', `User ${user.email} submitted documents for verification.`);

    res.status(200).json({ message: 'Verification documents submitted successfully, awaiting review' });
  } catch (error) {
    console.error('Error submitting verification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get current user data
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id); // req.user.id from authMiddleware
    if (!user || user.account_status === 'deleted') {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture_url: user.profile_picture_url || null,
      email: user.email,
      verified: user.verified,
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  signup,
  login,
  logout,
  requestPasswordReset,
  resetPassword,
  verifyEmail,
  submitVerification,
  getCurrentUser,
};