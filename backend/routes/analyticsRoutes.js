const express = require('express');
const router = express.Router();
const { 
  getOKRProgress, 
  getHealthScore, 
  getDepartmentStats 
} = require('../controllers/analyticsController');
const auth = require('../middleware/auth');

// 获取OKR进展统计数据
router.get('/progress', auth, getOKRProgress);

// 获取健康度评估数据
router.get('/health-score', auth, getHealthScore);

// 获取部门OKR统计数据
router.get('/department-stats', auth, getDepartmentStats);

module.exports = router;
