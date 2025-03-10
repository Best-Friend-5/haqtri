// server/models/BlockchainTransactions.js
const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const BlockchainTransactions = sequelize.define('BlockchainTransactions', {
  transaction_id: {
    type: DataTypes.INTEGER,
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
  hash: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Hash cannot be empty' },
    },
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'BlockchainTransactions',
  timestamps: false,
});

BlockchainTransactions.associate = (models) => {
  BlockchainTransactions.belongsTo(models.Property, { foreignKey: 'plot_id', as: 'property' });
};

module.exports = BlockchainTransactions;