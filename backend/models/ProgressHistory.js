const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ProgressHistory = sequelize.define('ProgressHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  keyResultId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'KeyResults',
      key: 'id'
    }
  },
  currentValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  previousValue: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  updatedBy: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

module.exports = ProgressHistory;