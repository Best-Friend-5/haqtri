// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const app = express();

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000', credentials: true })); // Restrict to frontend origin
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(passport.initialize()); // Initialize Passport for Google OAuth

// Serve static files (e.g., images)
app.use('/images', express.static(path.join(__dirname, 'images')));

// Mount routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes
app.use('/api/users', require('./routes/users')); // User management routes (single mount)
app.use('/api/properties', require('./routes/properties')); // Property management routes
app.use('/api/architects', require('./routes/architects')); // Architect management routes
app.use('/api/settings', require('./routes/settings')); // Settings management routes
app.use('/api/notifications', require('./routes/notifications')); // Notification preferences routes
app.use('/api/posts', require('./routes/posts')); // Posts management routes

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy', uptime: process.uptime() });
});

// Handle 404 errors (routes not found)
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Centralized error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;