// server/models/Comments.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Comments = sequelize.define('Comments', {
  comment_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  user_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      notNull: { msg: 'User ID is required' },
    },
  },
  post_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Post ID is required' },
    },
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Comment content cannot be empty' },
    },
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Comments',
  timestamps: false,
});

Comments.associate = (models) => {
  Comments.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Comments.belongsTo(models.Posts, { foreignKey: 'post_id', as: 'post' });
  Comments.hasMany(models.Likes, {
    foreignKey: 'entity_id',
    as: 'likes',
    constraints: false,
    scope: { entity_type: 'comment' },
  });
};

module.exports = Comments;