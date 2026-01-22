const sequelize = require('../config/db');
const Role = require('../models/Role');
const Department = require('../models/Department');
const User = require('../models/User');
const Permission = require('../models/Permission');
const RolePermission = require('../models/RolePermission');
const bcrypt = require('bcryptjs');

// 初始数据填充函数
const seedInitialData = async () => {
  try {
    console.log('开始填充初始数据...');

    // 1. 创建角色
    // 使用findOrCreate确保获取到完整的角色信息，包括id
    const [adminRole] = await Role.findOrCreate({ where: { name: 'admin' }, defaults: { description: '系统管理员' } });
    const [managerRole] = await Role.findOrCreate({ where: { name: 'manager' }, defaults: { description: '部门经理' } });
    const [employeeRole] = await Role.findOrCreate({ where: { name: 'employee' }, defaults: { description: '普通员工' } });
    const roles = [adminRole, managerRole, employeeRole];
    console.log('角色数据填充完成');

    // 2. 创建权限
    // 权限定义数组
    const permissionDefinitions = [
      // 目标管理权限
      { name: '查看目标', code: 'objective_view', module: 'objectives', description: '查看目标权限' },
      { name: '创建目标', code: 'objective_create', module: 'objectives', description: '创建目标权限' },
      { name: '编辑目标', code: 'objective_edit', module: 'objectives', description: '编辑目标权限' },
      { name: '删除目标', code: 'objective_delete', module: 'objectives', description: '删除目标权限' },
      { name: '审批目标', code: 'objective_approve', module: 'objectives', description: '审批目标权限' },
      
      // 关键结果管理权限
      { name: '查看关键结果', code: 'keyresult_view', module: 'keyResults', description: '查看关键结果权限' },
      { name: '创建关键结果', code: 'keyresult_create', module: 'keyResults', description: '创建关键结果权限' },
      { name: '编辑关键结果', code: 'keyresult_edit', module: 'keyResults', description: '编辑关键结果权限' },
      { name: '删除关键结果', code: 'keyresult_delete', module: 'keyResults', description: '删除关键结果权限' },
      
      // 用户管理权限
      { name: '查看用户', code: 'user_view', module: 'users', description: '查看用户权限' },
      { name: '创建用户', code: 'user_create', module: 'users', description: '创建用户权限' },
      { name: '编辑用户', code: 'user_edit', module: 'users', description: '编辑用户权限' },
      { name: '删除用户', code: 'user_delete', module: 'users', description: '删除用户权限' },
      
      // 角色权限管理权限
      { name: '查看角色', code: 'role_view', module: 'roles', description: '查看角色权限' },
      { name: '创建角色', code: 'role_create', module: 'roles', description: '创建角色权限' },
      { name: '编辑角色', code: 'role_edit', module: 'roles', description: '编辑角色权限' },
      { name: '删除角色', code: 'role_delete', module: 'roles', description: '删除角色权限' },
      { name: '分配权限', code: 'permission_assign', module: 'permissions', description: '分配权限权限' },
      
      // 数据分析权限
      { name: '查看分析报告', code: 'analytics_view', module: 'analytics', description: '查看分析报告权限' }
    ];
    
    // 使用findOrCreate确保每个权限都有正确的id
    const permissions = [];
    for (const permDef of permissionDefinitions) {
      const [perm] = await Permission.findOrCreate({
        where: { code: permDef.code },
        defaults: permDef
      });
      permissions.push(perm);
    }
    console.log('权限数据填充完成');

    // 3. 创建部门
    const departments = await Department.bulkCreate([
      { name: '总经办', description: '公司总经办' },
      { name: '技术部', description: '技术开发部门' },
      { name: '市场部', description: '市场营销部门' },
      { name: '销售部', description: '销售部门' },
      { name: '人力资源部', description: '人力资源部门' }
    ], { ignoreDuplicates: true });
    console.log('部门数据填充完成');

    // 4. 创建管理员用户
    // 密码：admin123
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const adminUser = await User.findOrCreate({
      where: { username: 'admin' },
      defaults: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: '系统管理员',
        roleId: roles[0].id,
        departmentId: departments[0].id
      }
    });
    console.log('管理员用户填充完成');

    // 5. 为角色分配权限
    // 获取所有权限ID
    const permissionIds = permissions.map(perm => perm.id);
    
    // 为管理员分配所有权限
    await RolePermission.bulkCreate(
      permissionIds.map(permissionId => ({
        roleId: roles[0].id,
        permissionId
      })),
      { ignoreDuplicates: true }
    );
    console.log('管理员权限分配完成');
    
    // 为经理分配部分权限
    const managerPermissionIds = permissions
      .filter(perm => !['user_delete', 'role_create', 'role_edit', 'role_delete', 'permission_assign'].includes(perm.code))
      .map(perm => perm.id);
    
    await RolePermission.bulkCreate(
      managerPermissionIds.map(permissionId => ({
        roleId: roles[1].id,
        permissionId
      })),
      { ignoreDuplicates: true }
    );
    console.log('经理权限分配完成');
    
    // 为员工分配基本权限
    const employeePermissionIds = permissions
      .filter(perm => ['objective_view', 'keyresult_view', 'analytics_view'].includes(perm.code))
      .map(perm => perm.id);
    
    await RolePermission.bulkCreate(
      employeePermissionIds.map(permissionId => ({
        roleId: roles[2].id,
        permissionId
      })),
      { ignoreDuplicates: true }
    );
    console.log('员工权限分配完成');

    console.log('初始数据填充成功！');
    console.log('\n登录信息：');
    console.log('用户名：admin');
    console.log('密码：admin123');
  } catch (error) {
    console.error('初始数据填充失败:', error);
  }
};

module.exports = seedInitialData;
