const express = require('express');
const router = express.Router();
const { 
  getPermissions, 
  getRoles, 
  createRole, 
  updateRole, 
  deleteRole, 
  getRolePermissions, 
  assignRolePermissions, 
  updateUserRole,
  getPermissionsByModule
} = require('../controllers/permissionController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/rolePermission');

// 权限管理路由

// 获取所有权限列表
router.get('/permissions', auth, isAdmin, getPermissions);

// 按模块获取权限列表
router.get('/permissions/module/:module', auth, isAdmin, getPermissionsByModule);

// 获取所有角色列表
router.get('/roles', auth, isAdmin, getRoles);

// 创建新角色
router.post('/roles', auth, isAdmin, createRole);

// 更新角色信息
router.put('/roles/:id', auth, isAdmin, updateRole);

// 删除角色
router.delete('/roles/:id', auth, isAdmin, deleteRole);

// 获取角色的权限列表
router.get('/roles/:id/permissions', auth, isAdmin, getRolePermissions);

// 为角色分配权限
router.post('/roles/:id/permissions', auth, isAdmin, assignRolePermissions);

// 更新用户角色
router.put('/users/:id/role', auth, isAdmin, updateUserRole);

module.exports = router;