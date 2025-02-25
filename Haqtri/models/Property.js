const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Property = sequelize.define('Property', {
  plot_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },
  owner_id: {
    type: DataTypes.BIGINT,
    allowNull: false,
    validate: {
      notNull: { msg: 'Owner ID is required' },
    },
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Address cannot be empty' },
    },
  },
  size: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      isDecimal: { msg: 'Size must be a decimal number' },
      min: { args: [0], msg: 'Size must be non-negative' },
    },
  },
  zoning_laws: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  environmental_impact_report: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  vr_model_path: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
}, {
  tableName: 'LandPlots', // Match your SQL table name
  timestamps: false, // No createdAt/updatedAt columns in your schema
});

// Define associations
Property.associate = (models) => {
  Property.belongsTo(models.User, {
    foreignKey: 'owner_id',
    as: 'owner', // Alias for the association
  });
  Property.hasMany(models.ConstructionProjects, {
    foreignKey: 'plot_id',
    as: 'projects',
  });
  Property.hasMany(models.Inventory, {
    foreignKey: 'plot_id',
    as: 'inventory',
  });
  Property.hasMany(models.BlockchainTransactions, {
    foreignKey: 'plot_id',
    as: 'transactions',
  });
};

module.exports = Property;