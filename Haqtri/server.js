// server.js
const app = require('./app');
const { sequelize } = require('./config/database');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Sync database and start server
sequelize.sync({ force: false }) // Set force: true to recreate tables (use with caution)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to sync database:', error);
  });