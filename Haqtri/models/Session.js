const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Session = sequelize.define('Session', {
  id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      notNull: { msg: 'User ID is required' },
    },
    field: 'userId', // Match SQL column name
  },
  device: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Token cannot be empty' },
    },
  },
}, {
  tableName: 'Session', // Match your SQL table name
  timestamps: false, // No createdAt/updatedAt columns in your schema
});

// Define associations
Session.associate = (models) => {
  Session.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user', // Alias for the association
  });
};

module.exports = Session;