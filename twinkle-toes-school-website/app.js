const express = require('express');
const dotenv = require('dotenv');
const sequelize = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());

// Example route
app.use('/api', require('./routes/index'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    await sequelize.authenticate();
    console.log(\Server running on port \\);
});
