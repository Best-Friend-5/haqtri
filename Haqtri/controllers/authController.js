const { User, Session } = require('../models');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken, verifyToken } = require('../utils/jwt');
const { sendEmail } = require('../utils/email');

// Signup a new user
const signup = async (req, res) => {
  try {
    const { email, phone, password, role_id } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password);
    const user = await User.create({
      email,
      phone,
      password_hash: hashedPassword,
      role_id: role_id || null, // Optional role_id
      verified: false, // Default to unverified
    });

    // Generate JWT token
    const token = generateToken(user.user_id);

    // Send welcome email
    await sendEmail(email, 'Welcome to haqtri', 'Thank you for joining haqtri! Please verify your email to get started.');

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

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Verify password
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = generateToken(user.user_id);

    // Create session record
    const session = await Session.create({
      userId: user.user_id,
      device: req.headers['user-agent'] || 'Unknown Device',
      token,
    });

    res.status(200).json({ message: 'Login successful', token, sessionId: session.id });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Logout a user from a specific session
const logout = async (req, res) => {
  try {
    const userId = req.user.id; // From authMiddleware
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
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate a temporary reset token (valid for 1 hour)
    const resetToken = generateToken(user.user_id, { expiresIn: '1h' });

    // Send reset email
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken}`; // Adjust URL for production
    await sendEmail(email, 'Password Reset Request', `Click here to reset your password: ${resetLink}`);

    res.status(200).json({ message: 'Password reset link sent to your email' });
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

    // Verify reset token
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update password
    const hashedPassword = await hashPassword(newPassword);
    await user.update({ password_hash: hashedPassword });

    // Invalidate all sessions for security
    await Session.destroy({ where: { userId: user.user_id } });

    // Send confirmation email
    await sendEmail(user.email, 'Password Reset Successful', 'Your haqtri password has been reset successfully.');

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Verify email (placeholder for email verification flow)
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ message: 'Verification token is required' });
    }

    // Verify token (assumes signup sends a verification token)
    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (error) {
      return res.status(400).json({ message: 'Invalid or expired verification token' });
    }

    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.verified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    await user.update({ verified: true });
    res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Error verifying email:', error);
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
};