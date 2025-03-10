// server/models/Roles.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Roles = sequelize.define('Roles', {
  role_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  role_name: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Role name cannot be empty' },
    },
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'Roles',
  timestamps: false,
});

Roles.associate = (models) => {
  Roles.hasMany(models.User, { foreignKey: 'role_id', as: 'users' });
};

module.exports = Roles;