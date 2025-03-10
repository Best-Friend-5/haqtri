const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Bookmark = sequelize.define('Bookmarks', {
  user_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  post_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Bookmarks',
  timestamps: false,
});

Bookmark.associate = (models) => {
  Bookmark.belongsTo(models.User, { foreignKey: 'user_id' });
  Bookmark.belongsTo(models.Posts, { foreignKey: 'post_id' });
};

module.exports = Bookmark;