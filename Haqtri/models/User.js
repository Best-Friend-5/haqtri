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
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: { msg: 'Must be a valid email address' },
      notEmpty: { msg: 'Email cannot be empty' },
    },
  },
  phone: {
    type: DataTypes.STRING(15),
    allowNull: true,
    validate: {
      len: {
        args: [7, 15],
        msg: 'Phone number must be between 7 and 15 characters',
      },
    },
  },
  password_hash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Password hash cannot be empty' },
    },
  },
  bvn: {
    type: DataTypes.CHAR(11),
    allowNull: true,
    validate: {
      len: {
        args: [11, 11],
        msg: 'BVN must be exactly 11 characters',
      },
    },
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
  registered_at: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'Users', // Match your SQL table name
  timestamps: false, // No createdAt/updatedAt columns; registered_at is explicit
});

// Define associations
User.associate = (models) => {
  User.belongsTo(models.Roles, {
    foreignKey: 'role_id',
    as: 'role',
  });
  User.hasOne(models.ArchitectProfiles, {
    foreignKey: 'architect_id',
    as: 'architectProfile',
  });
  User.hasOne(models.WorkerProfiles, {
    foreignKey: 'worker_id',
    as: 'workerProfile',
  });
  User.hasOne(models.AgentProfiles, {
    foreignKey: 'agent_id',
    as: 'agentProfile',
  });
  User.hasOne(models.Setting, {
    foreignKey: 'userId',
    as: 'setting',
  });
  User.hasOne(models.Notification, {
    foreignKey: 'userId',
    as: 'notification',
  });
  User.hasMany(models.Session, {
    foreignKey: 'userId',
    as: 'sessions',
  });
  User.hasOne(models.UserPreferences, {
    foreignKey: 'userId',
    as: 'preferences',
  });
  User.hasMany(models.Property, {
    foreignKey: 'owner_id',
    as: 'properties',
  });
};

module.exports = User;