// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\server.js
const app = require('./app');
const { sequelize } = require('./config/database');
require('dotenv').config();

const PORT = 5001;

console.log('Starting server...');
sequelize.authenticate()
  .then(() => {
    console.log('Database connection established');
    return sequelize.sync({ force: false });
  })
  .then(() => {
    console.log('Database synced successfully');
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
    });
  })
  .catch((error) => {
    console.error('Server startup error:', error);
  });

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});