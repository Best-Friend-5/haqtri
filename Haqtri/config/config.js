// server/config/config.js
require('dotenv').config();

module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  emailConfig: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
};