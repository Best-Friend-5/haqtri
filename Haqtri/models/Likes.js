// server/models/Likes.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Likes = sequelize.define('Likes', {
  user_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  entity_type: {
    type: DataTypes.ENUM('post', 'comment'),
    primaryKey: true,
    allowNull: false,
  },
  entity_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Likes',
  timestamps: false,
});

Likes.associate = (models) => {
  Likes.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Likes.belongsTo(models.Posts, {
    foreignKey: 'entity_id',
    as: 'post',
    constraints: false,
    scope: { entity_type: 'post' },
  });
  Likes.belongsTo(models.Comments, {
    foreignKey: 'entity_id',
    as: 'comment',
    constraints: false,
    scope: { entity_type: 'comment' },
  });
};

module.exports = Likes;