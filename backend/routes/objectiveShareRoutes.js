const express = require('express');
const router = express.Router();
const { 
  shareObjective, 
  getObjectiveShares, 
  updateObjectiveShare, 
  deleteObjectiveShare 
} = require('../controllers/objectiveShareController');
const auth = require('../middleware/auth');

// 共享目标
router.post('/', auth, shareObjective);

// 获取目标的共享列表
router.get('/objective/:objectiveId', auth, getObjectiveShares);

// 更新目标共享权限
router.put('/:id', auth, updateObjectiveShare);

// 删除目标共享关系
router.delete('/:id', auth, deleteObjectiveShare);

module.exports = router;
