const express = require('express');
const router = express.Router();
const { 
  createComment, 
  getCommentsByObjectiveId, 
  updateComment, 
  deleteComment 
} = require('../controllers/commentController');
const auth = require('../middleware/auth');

// 创建评论
router.post('/', auth, createComment);

// 获取目标的所有评论
router.get('/objective/:objectiveId', auth, getCommentsByObjectiveId);

// 更新评论
router.put('/:id', auth, updateComment);

// 删除评论
router.delete('/:id', auth, deleteComment);

module.exports = router;
