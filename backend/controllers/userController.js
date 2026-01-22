const User = require('../models/User');
const Role = require('../models/Role');
const Department = require('../models/Department');
const bcrypt = require('bcryptjs');

// 用户管理控制器

/**
 * 获取所有用户列表
 * @route GET /api/users
 * @access 管理员
 */
const getUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Role, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] }
      ],
      attributes: { exclude: ['password'] },
      order: [['id', 'ASC']]
    });
    res.status(200).json(users);
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 获取单个用户详情
 * @route GET /api/users/:id
 * @access 管理员
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id, {
      include: [
        { model: Role, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] }
      ],
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 创建新用户
 * @route POST /api/users
 * @access 管理员
 */
const createUser = async (req, res) => {
  try {
    const { username, email, password, name, roleId, departmentId } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已存在' });
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 创建用户
    const user = await User.create({
      username,
      email,
      password: hashedPassword,
      name,
      roleId,
      departmentId
    });

    // 返回用户信息（不含密码）
    const userResponse = {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      departmentId: user.departmentId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.status(201).json({ message: '用户创建成功', user: userResponse });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新用户信息
 * @route PUT /api/users/:id
 * @access 管理员
 */
const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email, name, roleId, departmentId } = req.body;

    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查用户名是否已被其他用户使用
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ where: { username } });
      if (existingUser) {
        return res.status(400).json({ message: '用户名已存在' });
      }
    }

    // 检查邮箱是否已被其他用户使用
    if (email && email !== user.email) {
      const existingEmail = await User.findOne({ where: { email } });
      if (existingEmail) {
        return res.status(400).json({ message: '邮箱已存在' });
      }
    }

    // 更新用户信息
    await user.update({
      username,
      email,
      name,
      roleId,
      departmentId
    });

    // 获取更新后的用户信息（含关联数据）
    const updatedUser = await User.findByPk(id, {
      include: [
        { model: Role, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] }
      ],
      attributes: { exclude: ['password'] }
    });

    res.status(200).json({ message: '用户更新成功', user: updatedUser });
  } catch (error) {
    console.error('更新用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 更新用户密码
 * @route PUT /api/users/:id/password
 * @access 管理员或当前用户
 */
const updateUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentPassword, newPassword } = req.body;

    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 检查当前密码是否正确（只有非管理员需要验证）
    if (req.user.roleId !== 1) {
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: '当前密码错误' });
      }
    }

    // 密码加密
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // 更新密码
    await user.update({ password: hashedPassword });

    res.status(200).json({ message: '密码更新成功' });
  } catch (error) {
    console.error('更新密码错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

/**
 * 删除用户
 * @route DELETE /api/users/:id
 * @access 管理员
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // 查找用户
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 不允许删除自己
    if (user.id === req.user.userId) {
      return res.status(400).json({ message: '不能删除自己' });
    }

    // 删除用户
    await user.destroy();

    res.status(200).json({ message: '用户删除成功' });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser
};
