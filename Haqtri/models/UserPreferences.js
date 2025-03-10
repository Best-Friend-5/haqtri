// server/models/UserPreferences.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const UserPreferences = sequelize.define('UserPreferences', {
  userId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    field: 'userId',
    validate: {
      notNull: { msg: 'User ID is required' },
    },
  },
  preferred_languages: {
    type: DataTypes.STRING,
    allowNull: true,
  },
}, {
  tableName: 'UserPreferences',
  timestamps: false,
});

UserPreferences.associate = (models) => {
  UserPreferences.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

module.exports = UserPreferences;