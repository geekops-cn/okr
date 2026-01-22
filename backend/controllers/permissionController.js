const Permission = require('../models/Permission');
const Role = require('../models/Role');
const RolePermission = require('../models/RolePermission');
const User = require('../models/User');

// 权限管理控制器

/**
 * 获取所有权限列表
 * @route GET /api/permissions
 * @access 管理员
 */
const getPermissions = async (req, res) => {
  try {
    const permissions = await Permission.findAll({
      order: [['module', 'ASC'], ['name', 'ASC']]
    });
    res.status(200).json(permissions);
  } catch (error) {
    console.error('获取权限列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取所有角色列表
 * @route GET /api/roles
 * @access 管理员
 */
const getRoles = async (req, res) => {
  try {
    const roles = await Role.findAll({
      include: [Permission],
      order: [['id', 'ASC']]
    });
    res.status(200).json(roles);
  } catch (error) {
    console.error('获取角色列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 创建新角色
 * @route POST /api/roles
 * @access 管理员
 */
const createRole = async (req, res) => {
  try {
    const { name, description, permissions } = req.body;
    
    // 验证角色名称是否已存在
    const existingRole = await Role.findOne({ where: { name } });
    if (existingRole) {
      return res.status(400).json({ message: '角色名称已存在' });
    }
    
    // 创建角色
    const role = await Role.create({
      name,
      description
    });
    
    // 分配权限（如果提供了权限列表）
    if (permissions && permissions.length > 0) {
      const rolePermissions = permissions.map(permissionId => ({
        roleId: role.id,
        permissionId
      }));
      await RolePermission.bulkCreate(rolePermissions);
    }
    
    // 查询包含权限的角色信息
    const newRole = await Role.findByPk(role.id, {
      include: [Permission]
    });
    
    res.status(201).json(newRole);
  } catch (error) {
    console.error('创建角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新角色信息
 * @route PUT /api/roles/:id
 * @access 管理员
 */
const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, permissions } = req.body;
    
    // 查找角色
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    
    // 验证角色名称是否已被其他角色使用
    if (name !== role.name) {
      const existingRole = await Role.findOne({ where: { name } });
      if (existingRole) {
        return res.status(400).json({ message: '角色名称已存在' });
      }
    }
    
    // 更新角色信息
    await role.update({
      name,
      description
    });
    
    // 更新角色权限
    if (permissions) {
      // 删除原有权限关联
      await RolePermission.destroy({ where: { roleId: id } });
      
      // 创建新的权限关联
      if (permissions.length > 0) {
        const rolePermissions = permissions.map(permissionId => ({
          roleId: id,
          permissionId
        }));
        await RolePermission.bulkCreate(rolePermissions);
      }
    }
    
    // 查询更新后的角色信息
    const updatedRole = await Role.findByPk(id, {
      include: [Permission]
    });
    
    res.status(200).json(updatedRole);
  } catch (error) {
    console.error('更新角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 删除角色
 * @route DELETE /api/roles/:id
 * @access 管理员
 */
const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查角色是否存在
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    
    // 检查是否有用户正在使用该角色
    const usersWithRole = await User.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      return res.status(400).json({ message: '该角色下还有用户，无法删除' });
    }
    
    // 删除角色权限关联
    await RolePermission.destroy({ where: { roleId: id } });
    
    // 删除角色
    await role.destroy();
    
    res.status(200).json({ message: '角色删除成功' });
  } catch (error) {
    console.error('删除角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取角色的权限列表
 * @route GET /api/roles/:id/permissions
 * @access 管理员
 */
const getRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 检查角色是否存在
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    
    // 获取角色的权限
    const rolePermissions = await Role.findByPk(id, {
      include: [Permission]
    });
    
    res.status(200).json(rolePermissions.Permissions);
  } catch (error) {
    console.error('获取角色权限错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 为角色分配权限
 * @route POST /api/roles/:id/permissions
 * @access 管理员
 */
const assignRolePermissions = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionIds } = req.body;
    
    // 检查角色是否存在
    const role = await Role.findByPk(id);
    if (!role) {
      return res.status(404).json({ message: '角色不存在' });
    }
    
    // 检查权限ID是否有效
    const validPermissions = await Permission.findAll({ where: { id: permissionIds } });
    if (validPermissions.length !== permissionIds.length) {
      return res.status(400).json({ message: '包含无效的权限ID' });
    }
    
    // 删除原有权限关联
    await RolePermission.destroy({ where: { roleId: id } });
    
    // 创建新的权限关联
    const rolePermissions = permissionIds.map(permissionId => ({
      roleId: id,
      permissionId
    }));
    
    await RolePermission.bulkCreate(rolePermissions);
    
    // 查询更新后的角色权限
    const updatedRole = await Role.findByPk(id, {
      include: [Permission]
    });
    
    res.status(200).json(updatedRole.Permissions);
  } catch (error) {
    console.error('分配角色权限错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新用户角色
 * @route PUT /api/users/:id/role
 * @access 管理员
 */
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { roleId } = req.body;
    
    // 检查用户是否存在
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }
    
    // 检查角色是否存在
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: '无效的角色ID' });
    }
    
    // 更新用户角色
    await user.update({ roleId });
    
    // 查询更新后的用户信息
    const updatedUser = await User.findByPk(id, {
      include: [Role]
    });
    
    res.status(200).json(updatedUser);
  } catch (error) {
    console.error('更新用户角色错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 按模块获取权限列表
 * @route GET /api/permissions/module/:module
 * @access 管理员
 */
const getPermissionsByModule = async (req, res) => {
  try {
    const { module } = req.params;
    const permissions = await Permission.findAll({
      where: { module },
      order: [['name', 'ASC']]
    });
    res.status(200).json(permissions);
  } catch (error) {
    console.error('按模块获取权限列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getPermissions,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getRolePermissions,
  assignRolePermissions,
  updateUserRole,
  getPermissionsByModule
};