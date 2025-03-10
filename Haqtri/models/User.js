// C:\Users\Abz\Downloads\Haqtri\Haqtri\server\models\User.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const User = sequelize.define('Users', {
  user_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  role_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  // Name Fields (Global Legal Standards)
  title: {
    type: DataTypes.STRING(20),
    allowNull: true, // e.g., Mr., Mrs., Dr., Chief
    validate: { len: [1, 20] },
  },
  first_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'First name cannot be empty' },
      len: [2, 50],
      is: /^[a-zA-Z\s-]+$/, // Adaptable for non-Latin scripts later
    },
  },
  last_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Last name cannot be empty' },
      len: [2, 50],
      is: /^[a-zA-Z\s-]+$/, 
    },
  },
  middle_name: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  other_names: {
    type: DataTypes.STRING(255),
    allowNull: true, // For additional names common in Africa
  },
  business_name: {
    type: DataTypes.STRING(255),
    allowNull: true,
    validate: { len: [2, 255] },
  },
  // Contact Info
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Must be a valid email address' },
      notEmpty: { msg: 'Email cannot be empty' },
    },
  },
  phone_country_code: {
    type: DataTypes.STRING(5),
    allowNull: true, // e.g., +234 for Nigeria
    validate: { is: /^\+?[0-9]{1,4}$/ },
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: { len: [7, 15], is: /^[0-9]+$/ },
  },
  alt_phone_country_code: {
    type: DataTypes.STRING(5),
    allowNull: true,
  },
  alt_phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: { len: [7, 15], is: /^[0-9]+$/ },
  },
  // Authentication
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: { notEmpty: { msg: 'Password hash cannot be empty' } },
  },
  googleId: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  // Verification (Nigeria + Global)
  bvn: {
    type: DataTypes.CHAR(11),
    allowNull: true, // Nigeria-specific
    validate: { len: [11, 11], msg: 'BVN must be exactly 11 characters' },
  },
  national_id: {
    type: DataTypes.STRING(50),
    allowNull: true, // Flexible for other countries (e.g., Ghana Card, SSN)
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  verification_status: {
    type: DataTypes.ENUM('pending', 'verified', 'rejected', 'expired'),
    allowNull: false,
    defaultValue: 'pending',
  },
  verification_date: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  verification_method: {
    type: DataTypes.STRING(50),
    allowNull: true, // e.g., 'bvn', 'national_id', 'manual'
  },
  // Address (Global Flexibility)
  address_line1: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  address_line2: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true,
  },
  state_province_region: {
    type: DataTypes.STRING(100),
    allowNull: true, // Flexible naming for global use
  },
  postal_code: {
    type: DataTypes.STRING(20),
    allowNull: true, // Varies by country
  },
  country_code: {
    type: DataTypes.CHAR(2),
    allowNull: true, // ISO 3166-1 alpha-2 (e.g., NG, US)
    defaultValue: 'NG',
    validate: { is: /^[A-Z]{2}$/ },
  },
  // Demographics
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: { isBefore: new Date().toISOString().split('T')[0] },
  },
  gender: {
    type: DataTypes.ENUM('male', 'female', 'other', 'prefer_not_to_say'),
    allowNull: true,
  },
  nationality: {
    type: DataTypes.CHAR(2),
    allowNull: true, // ISO 3166-1 alpha-2
    validate: { is: /^[A-Z]{2}$/ },
  },
  preferred_language: {
    type: DataTypes.CHAR(2),
    allowNull: true, // ISO 639-1 (e.g., 'en', 'fr', 'yo')
    defaultValue: 'en',
    validate: { is: /^[a-z]{2}$/ },
  },
  // Metadata
  registered_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
  last_login_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  account_status: {
    type: DataTypes.ENUM('active', 'inactive', 'suspended', 'deleted'),
    allowNull: false,
    defaultValue: 'active',
  },
  profile_picture_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  timezone: {
    type: DataTypes.STRING(50),
    allowNull: true, // e.g., 'Africa/Lagos'
    defaultValue: 'Africa/Lagos',
  },
  currency_code: {
    type: DataTypes.CHAR(3),
    allowNull: true, // ISO 4217 (e.g., NGN, USD)
    defaultValue: 'NGN',
    validate: { is: /^[A-Z]{3}$/ },
  },
}, {
  tableName: 'Users',
  timestamps: false,
});

// Associations (unchanged)
User.associate = (models) => {
  User.belongsTo(models.Roles, { foreignKey: 'role_id', as: 'role' });
  User.hasOne(models.ArchitectProfiles, { foreignKey: 'architect_id', as: 'architectProfile' });
  User.hasOne(models.WorkerProfiles, { foreignKey: 'worker_id', as: 'workerProfile' });
  User.hasOne(models.AgentProfiles, { foreignKey: 'agent_id', as: 'agentProfile' });
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

module.exports = User;