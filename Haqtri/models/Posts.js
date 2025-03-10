// server/models/Posts.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Posts = sequelize.define('Posts', {
  post_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  media_path: {
    type: DataTypes.JSON, // Updated to JSON from TEXT
    allowNull: true,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
  visibility: {
    type: DataTypes.ENUM('public', 'private'),
    allowNull: true,
  },
  likes: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  comments: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  shares: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
}, {
  tableName: 'Posts',
  timestamps: false,
});

Posts.associate = (models) => {
  Posts.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Posts.hasMany(models.Likes, { foreignKey: 'entity_id', as: 'likes', constraints: false, scope: { entity_type: 'post' } });
  Posts.hasMany(models.Comments, { foreignKey: 'post_id', as: 'comments' });
  Posts.hasMany(models.Bookmark, { foreignKey: 'post_id', as: 'bookmarks' });
};

module.exports = Posts;