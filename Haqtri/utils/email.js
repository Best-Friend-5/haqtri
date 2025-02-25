const nodemailer = require('nodemailer');
const { emailConfig } = require('../config/config');

/**
 * Create a Nodemailer transporter instance
 * @returns {Object} - Nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail', // Using Gmail; adjust for other services (e.g., SendGrid)
    auth: {
      user: emailConfig.user,
      pass: emailConfig.pass,
    },
  });
};

/**
 * Send an email
 * @param {string} to - Recipient email address
 * @param {string} subject - Email subject
 * @param {string} text - Plain text email body
 * @param {string} [html] - Optional HTML email body
 * @returns {Promise<void>}
 */
const sendEmail = async (to, subject, text, html = null) => {
  try {
    // Validate inputs
    if (!to || typeof to !== 'string' || !to.includes('@')) {
      throw new Error('Invalid recipient email address');
    }
    if (!subject || typeof subject !== 'string') {
      throw new Error('Subject must be a non-empty string');
    }
    if (!text || typeof text !== 'string') {
      throw new Error('Text body must be a non-empty string');
    }

    const transporter = createTransporter();

    // Email options
    const mailOptions = {
      from: `"haqtri Support" <${emailConfig.user}>`, // Sender address
      to, // Recipient address
      subject, // Subject line
      text, // Plain text body
      html: html || undefined, // Optional HTML body
    };

    // Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.messageId}`);
  } catch (error) {
    console.error('Error sending email:', error.message);
    throw error; // Re-throw for controller-level handling
  }
};

/**
 * Send a verification email (utility function)
 * @param {string} to - Recipient email address
 * @param {string} token - Verification token
 * @returns {Promise<void>}
 */
const sendVerificationEmail = async (to, token) => {
  const verificationUrl = `http://localhost:3000/verify-email?token=${token}`; // Adjust for production
  const subject = 'Verify Your haqtri Email';
  const text = `Please verify your email by clicking the link below:\n\n${verificationUrl}\n\nIf you did not request this, please ignore this email.`;
  const html = `
    <h3>Verify Your haqtri Email</h3>
    <p>Please click the link below to verify your email:</p>
    <a href="${verificationUrl}" style="color: #4A8B6F; text-decoration: none;">Verify Email</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail(to, subject, text, html);
};

/**
 * Send a password reset email (utility function)
 * @param {string} to - Recipient email address
 * @param {string} token - Reset token
 * @returns {Promise<void>}
 */
const sendPasswordResetEmail = async (to, token) => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`; // Adjust for production
  const subject = 'Reset Your haqtri Password';
  const text = `You requested a password reset. Click the link below to reset your password:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email.`;
  const html = `
    <h3>Reset Your haqtri Password</h3>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="color: #4A8B6F; text-decoration: none;">Reset Password</a>
    <p>If you did not request this, please ignore this email.</p>
  `;

  await sendEmail(to, subject, text, html);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
};