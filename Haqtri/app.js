// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const app = express();

// Middleware setup
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(passport.initialize());

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Mount routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/architects', require('./routes/architects'));
app.use('/api/settings', require('./routes/settings'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/posts', require('./routes/posts'));
app.use('/api/stories', require('./routes/stories')); // Added for stories

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ message: 'Server is healthy', uptime: process.uptime() });
});

// Handle 404 errors
app.use((req, res, next) => {
  res.status(404).json({ message: `Route ${req.method} ${req.path} not found` });
});

// Centralized error handling middleware
app.use(errorHandler);

module.exports = app;