// server/models/ConstructionProjects.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ConstructionProjects = sequelize.define('ConstructionProjects', {
  project_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  plot_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Plot ID is required' },
    },
  },
  worker_id: {
    type: DataTypes.BIGINT,
    allowNull: true,
  },
  start_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  end_date: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM('planned', 'in-progress', 'completed'),
    allowNull: true,
  },
}, {
  tableName: 'ConstructionProjects',
  timestamps: false,
});

ConstructionProjects.associate = (models) => {
  ConstructionProjects.belongsTo(models.Property, { foreignKey: 'plot_id', as: 'property' });
};

module.exports = ConstructionProjects;