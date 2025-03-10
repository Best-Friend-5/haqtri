// server/models/index.js (complete updated version)
const { Sequelize } = require('sequelize');
const { sequelize } = require('../config/database');

// Import all models
const User = require('./User');
const ArchitectProfiles = require('./Architect');
const Setting = require('./Settings');
const Notification = require('./Notification');
const Session = require('./Session');
const Property = require('./Property');
const Posts = require('./Posts');
const Likes = require('./Likes');
const Comments = require('./Comments');
const Bookmark = require('./Bookmark');
const Stories = require('./Stories');
const Roles = require('./Roles');
const UserPreferences = require('./UserPreferences');
const ConstructionProjects = require('./ConstructionProjects');
const Inventory = require('./Inventory');
const BlockchainTransactions = require('./BlockchainTransactions');

// Define associations
User.associate = (models) => {
  User.belongsTo(models.Roles, { foreignKey: 'role_id', as: 'role' });
  User.hasOne(models.ArchitectProfiles, { foreignKey: 'architect_id', as: 'architectProfile' });
  User.hasOne(models.Setting, { foreignKey: 'userId', as: 'setting' });
  User.hasOne(models.Notification, { foreignKey: 'userId', as: 'notification' });
  User.hasMany(models.Session, { foreignKey: 'userId', as: 'sessions' });
  User.hasOne(models.UserPreferences, { foreignKey: 'userId', as: 'preferences' });
  User.hasMany(models.Property, { foreignKey: 'owner_id', as: 'properties' });
  User.hasMany(models.Posts, { foreignKey: 'user_id', as: 'posts' });
  User.hasMany(models.Likes, { foreignKey: 'user_id', as: 'likes' });
  User.hasMany(models.Comments, { foreignKey: 'user_id', as: 'comments' });
  User.hasMany(models.Bookmark, { foreignKey: 'user_id', as: 'bookmarks' });
  User.hasMany(models.Stories, { foreignKey: 'user_id', as: 'stories' });
};

ArchitectProfiles.associate = (models) => {
  ArchitectProfiles.belongsTo(models.User, { foreignKey: 'architect_id', as: 'user' });
};

Setting.associate = (models) => {
  Setting.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

Notification.associate = (models) => {
  Notification.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

Session.associate = (models) => {
  Session.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

Property.associate = (models) => {
  Property.belongsTo(models.User, { foreignKey: 'owner_id', as: 'owner' });
  Property.hasMany(models.ConstructionProjects, { foreignKey: 'plot_id', as: 'projects' });
  Property.hasMany(models.Inventory, { foreignKey: 'plot_id', as: 'inventory' });
  Property.hasMany(models.BlockchainTransactions, { foreignKey: 'plot_id', as: 'transactions' });
};

Posts.associate = (models) => {
  Posts.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Posts.hasMany(models.Likes, { foreignKey: 'entity_id', as: 'postLikes', constraints: false, scope: { entity_type: 'post' } });
  Posts.hasMany(models.Comments, { foreignKey: 'post_id', as: 'postComments' }); // Changed 'comments' to 'postComments'
  Posts.hasMany(models.Bookmark, { foreignKey: 'post_id', as: 'bookmarks' });
};

Likes.associate = (models) => {
  Likes.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Likes.belongsTo(models.Posts, { foreignKey: 'entity_id', as: 'post', constraints: false, scope: { entity_type: 'post' } });
  Likes.belongsTo(models.Comments, { foreignKey: 'entity_id', as: 'comment', constraints: false, scope: { entity_type: 'comment' } });
};

Comments.associate = (models) => {
  Comments.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Comments.belongsTo(models.Posts, { foreignKey: 'post_id', as: 'post' });
  Comments.hasMany(models.Likes, { foreignKey: 'entity_id', as: 'commentLikes', constraints: false, scope: { entity_type: 'comment' } });
};

Bookmark.associate = (models) => {
  Bookmark.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
  Bookmark.belongsTo(models.Posts, { foreignKey: 'post_id', as: 'post' });
};

Stories.associate = (models) => {
  Stories.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
};

Roles.associate = (models) => {
  Roles.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
};

UserPreferences.associate = (models) => {
  UserPreferences.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
};

ConstructionProjects.associate = (models) => {
  ConstructionProjects.belongsTo(models.Property, { foreignKey: 'plot_id', as: 'property' });
};

Inventory.associate = (models) => {
  Inventory.belongsTo(models.Property, { foreignKey: 'plot_id', as: 'property' });
};

BlockchainTransactions.associate = (models) => {
  BlockchainTransactions.belongsTo(models.Property, { foreignKey: 'plot_id', as: 'property' });
};

// Associate all models
const models = {
  User,
  ArchitectProfiles,
  Setting,
  Notification,
  Session,
  Property,
  Posts,
  Likes,
  Comments,
  Bookmark,
  Stories,
  Roles,
  UserPreferences,
  ConstructionProjects,
  Inventory,
  BlockchainTransactions,
};

Object.values(models).forEach(model => {
  if (model.associate) {
    model.associate(models);
  }
});

// Export models and sequelize instance
module.exports = {
  sequelize,
  Sequelize,
  User,
  ArchitectProfiles,
  Setting,
  Notification,
  Session,
  Property,
  Posts,
  Likes,
  Comments,
  Bookmark,
  Stories,
  Roles,
  UserPreferences,
  ConstructionProjects,
  Inventory,
  BlockchainTransactions,
};