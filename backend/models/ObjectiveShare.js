const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ObjectiveShare = sequelize.define('ObjectiveShare', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  objectiveId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Objectives',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  departmentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Departments',
      key: 'id'
    }
  },
  accessLevel: {
    type: DataTypes.ENUM('view', 'edit'),
    defaultValue: 'view'
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    onUpdate: DataTypes.NOW
  }
});

module.exports = ObjectiveShare;
