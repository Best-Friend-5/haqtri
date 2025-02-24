const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { errorHandler } = require('./middleware/errorHandler');
const app = express();

// Middleware setup
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Mount routes
app.use('/api/auth', require('./routes/auth')); // Authentication routes
app.use('/api/users', require('./routes/users')); // User management routes
app.use('/api/properties', require('./routes/properties')); // Property management routes
app.use('/api/architects', require('./routes/architects')); // Architect management routes
app.use('/api/settings', require('./routes/settings')); // Settings management routes
app.use('/api/notifications', require('./routes/notifications')); // Notification preferences routes

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