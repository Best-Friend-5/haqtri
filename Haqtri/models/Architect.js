const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ArchitectProfiles = sequelize.define('ArchitectProfiles', {
  architect_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
  },
  registration_number: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Registration number cannot be empty' },
    },
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  specialty: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'ArchitectProfiles', // Match your SQL table name
  timestamps: false, // No createdAt/updatedAt columns in your schema
});

// Define associations
ArchitectProfiles.associate = (models) => {
  ArchitectProfiles.belongsTo(models.User, {
    foreignKey: 'architect_id',
    as: 'user', // Alias for the association
  });
};

module.exports = ArchitectProfiles;