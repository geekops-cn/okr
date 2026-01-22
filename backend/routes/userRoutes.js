const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  updateUserPassword,
  deleteUser
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const { isAdmin } = require('../middleware/rolePermission');

// 用户管理路由

// 获取所有用户列表
router.get('/users', auth, isAdmin, getUsers);

// 获取单个用户详情
router.get('/users/:id', auth, isAdmin, getUserById);

// 创建新用户
router.post('/users', auth, isAdmin, createUser);

// 更新用户信息
router.put('/users/:id', auth, isAdmin, updateUser);

// 更新用户密码
router.put('/users/:id/password', auth, isAdmin, updateUserPassword);

// 删除用户
router.delete('/users/:id', auth, isAdmin, deleteUser);

module.exports = router;
