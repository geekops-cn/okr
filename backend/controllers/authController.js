const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Role = require('../models/Role');
const Department = require('../models/Department');

// 注册新用户
const register = async (req, res) => {
  try {
    const { username, email, password, name, roleId, departmentId } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(400).json({ message: '用户名已存在' });
    }

    const existingEmail = await User.findOne({ where: { email } });
    if (existingEmail) {
      return res.status(400).json({ message: '邮箱已被注册' });
    }

    // 验证角色是否存在
    const role = await Role.findByPk(roleId);
    if (!role) {
      return res.status(400).json({ message: '无效的角色ID' });
    }

    // 部门ID可选，只有提供时才验证
    if (departmentId) {
      const department = await Department.findByPk(departmentId);
      if (!department) {
        return res.status(400).json({ message: '无效的部门ID' });
      }
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

    res.status(201).json({ message: '用户注册成功', user: { id: user.id, username: user.username, email: user.email, name: user.name } });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 用户登录
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: '用户名或密码错误' });
    }

    // 生成JWT令牌
    const payload = {
      userId: user.id,
      username: user.username,
      roleId: user.roleId
    };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN
    });

    res.status(200).json({
      message: '登录成功',
      token: `Bearer ${token}`,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        roleId: user.roleId,
        departmentId: user.departmentId
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取当前用户信息
const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'username', 'email', 'name', 'roleId', 'departmentId'],
      include: [
        { model: Role, attributes: ['name', 'description'] },
        { model: Department, attributes: ['name', 'description'] }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.status(200).json({ user });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  register,
  login,
  getCurrentUser
};
