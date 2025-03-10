// server/models/Stories.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Stories = sequelize.define('Stories', {
  story_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  image_path: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Stories',
  timestamps: false,
});

Stories.associate = (models) => {
  Stories.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

module.exports = Stories;