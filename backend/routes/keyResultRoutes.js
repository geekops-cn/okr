const express = require('express');
const router = express.Router();
const { 
  createKeyResult, 
  updateKeyResult, 
  updateKeyResultProgress, 
  deleteKeyResult,
  getKeyResultProgressHistory 
} = require('../controllers/keyResultController');
const auth = require('../middleware/auth');

// 创建关键结果
router.post('/', auth, createKeyResult);

// 更新关键结果
router.put('/:id', auth, updateKeyResult);

// 更新关键结果进度
router.put('/:id/progress', auth, updateKeyResultProgress);

// 删除关键结果
router.delete('/:id', auth, deleteKeyResult);

// 获取关键结果的进度历史记录
router.get('/:id/progress-history', auth, getKeyResultProgressHistory);

module.exports = router;
