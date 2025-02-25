const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Setting = sequelize.define('Setting', {
  userId: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    field: 'userId', // Match SQL column name
    validate: {
      notNull: { msg: 'User ID is required' },
    },
  },
  privacy: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Public',
    validate: {
      isIn: {
        args: [['Public', 'Friends Only', 'Private']],
        msg: 'Privacy must be one of: Public, Friends Only, Private',
      },
    },
  },
  notifications: {
    type: DataTypes.JSON,
    allowNull: true,
  },
}, {
  tableName: 'Setting', // Match your SQL table name
  timestamps: false, // No createdAt/updatedAt columns in your schema
});

// Define associations
Setting.associate = (models) => {
  Setting.belongsTo(models.User, {
    foreignKey: 'userId',
    as: 'user', // Alias for the association
  });
};

module.exports = Setting;