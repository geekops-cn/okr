const User = require('../models/User');
const Role = require('../models/Role');
const Permission = require('../models/Permission');

/**
 * 基于角色的权限中间件
 * @param {string|string[]} permissions - 所需权限的code或权限数组
 * @returns {Function} Express中间件函数
 */
const rolePermission = (permissions) => {
  return async (req, res, next) => {
    try {
      // 从请求对象中获取用户ID（由auth中间件设置）
      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ message: '未授权访问' });
      }

      // 查询用户及其角色和权限
      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            include: [Permission]
          }
        ]
      });

      if (!user) {
        return res.status(404).json({ message: '用户不存在' });
      }

      // 获取用户的所有权限code
      const userPermissions = user.Role.Permissions.map(perm => perm.code);
      
      // 检查用户是否具有所需权限
      let hasPermission = false;
      
      if (Array.isArray(permissions)) {
        // 如果是权限数组，检查用户是否至少拥有其中一个权限
        hasPermission = permissions.some(perm => userPermissions.includes(perm));
      } else {
        // 如果是单个权限，检查用户是否拥有该权限
        hasPermission = userPermissions.includes(permissions);
      }
      
      if (!hasPermission) {
        return res.status(403).json({ message: '没有操作权限' });
      }
      
      // 将用户权限添加到请求对象，以便后续使用
      req.userPermissions = userPermissions;
      req.userRole = user.Role;
      
      next();
    } catch (error) {
      console.error('权限检查错误:', error);
      res.status(500).json({ message: '服务器错误' });
    }
  };
};

/**
 * 检查用户是否为管理员
 * @returns {Function} Express中间件函数
 */
const isAdmin = (req, res, next) => {
  try {
    // 从请求对象中获取用户角色（由auth中间件设置）
    const roleId = req.user?.roleId;
    if (!roleId) {
      return res.status(401).json({ message: '未授权访问' });
    }
    
    // 管理员角色ID为1（初始数据中定义）
    if (roleId !== 1) {
      return res.status(403).json({ message: '只有管理员可以访问' });
    }
    
    next();
  } catch (error) {
    console.error('管理员权限检查错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = { rolePermission, isAdmin };