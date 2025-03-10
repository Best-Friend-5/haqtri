// server/models/Inventory.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  plot_id: {
    type: DataTypes.BIGINT,
    primaryKey: true,
    allowNull: false,
    validate: {
      notNull: { msg: 'Plot ID is required' },
    },
  },
  material_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    allowNull: false,
    validate: {
      notNull: { msg: 'Material ID is required' },
    },
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      notNull: { msg: 'Quantity is required' },
      min: { args: 0, msg: 'Quantity cannot be negative' },
    },
  },
}, {
  tableName: 'Inventory',
  timestamps: false,
});

Inventory.associate = (models) => {
  Inventory.belongsTo(models.Property, { foreignKey: 'plot_id', as: 'property' });
};

module.exports = Inventory;