const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  userId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    field: 'user_id', // Match SQL column name
  },
  emailEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: 'emailEnabled', // Match SQL column name
  },
}, {
  tableName: 'Notification', // Match your SQL table name
  timestamps: false, // No createdAt/updatedAt columns in your schema
});

// Define associations
Notification.associate = (models) => {
  Notification.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user', // Alias for the association
  });
};

module.exports = Notification;