const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  email: {
    type: DataTypes.STRING(100),
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    comment: '用户显示名称，用于界面展示'
  },
  roleId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Roles',
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

module.exports = User;

// 在模型定义后导入其他模型，避免循环依赖
const Role = require('./Role');
const Department = require('./Department');
const Permission = require('./Permission');

// 关联关系
User.belongsTo(Role, { foreignKey: 'roleId' });
User.belongsTo(Department, { foreignKey: 'departmentId' });

// 通过角色关联权限
User.prototype.hasPermission = async function(permissionCode) {
  const user = await User.findByPk(this.id, {
    include: [
      {
        model: Role,
        include: [Permission]
      }
    ]
  });
  
  return user.Role.Permissions.some(permission => permission.code === permissionCode);
};
