const express = require('express');
const router = express.Router();
const { 
  createObjective, 
  getAllObjectives, 
  getObjectiveById, 
  updateObjective, 
  deleteObjective 
} = require('../controllers/objectiveController');
const auth = require('../middleware/auth');

// 创建目标
router.post('/', auth, createObjective);

// 获取所有目标
router.get('/', auth, getAllObjectives);

// 获取单个目标详情
router.get('/:id', auth, getObjectiveById);

// 更新目标
router.put('/:id', auth, updateObjective);

// 删除目标
router.delete('/:id', auth, deleteObjective);

module.exports = router;
