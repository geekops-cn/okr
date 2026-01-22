const Comment = require('../models/Comment');
const Objective = require('../models/Objective');
const User = require('../models/User');

// 创建评论
const createComment = async (req, res) => {
  try {
    const { objectiveId, content } = req.body;
    const userId = req.user.userId;

    // 验证目标是否存在
    const objective = await Objective.findByPk(objectiveId);
    if (!objective) {
      return res.status(400).json({ message: '无效的目标ID' });
    }

    // 创建评论
    const comment = await Comment.create({
      objectiveId,
      userId,
      content
    });

    // 获取完整评论信息（包含用户信息）
    const fullComment = await Comment.findByPk(comment.id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    res.status(201).json({ message: '评论创建成功', comment: fullComment });
  } catch (error) {
    console.error('创建评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取目标的所有评论
const getCommentsByObjectiveId = async (req, res) => {
  try {
    const { objectiveId } = req.params;

    // 验证目标是否存在
    const objective = await Objective.findByPk(objectiveId);
    if (!objective) {
      return res.status(400).json({ message: '无效的目标ID' });
    }

    // 获取评论
    const comments = await Comment.findAll({
      where: { objectiveId },
      include: [{ model: User, attributes: ['id', 'name'] }],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ comments });
  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新评论
const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    // 检查评论是否存在
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 验证是否为评论作者
    if (comment.userId !== userId) {
      return res.status(403).json({ message: '无权修改此评论' });
    }

    // 更新评论
    await comment.update({ content });

    // 获取更新后的完整评论信息
    const updatedComment = await Comment.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    res.status(200).json({ message: '评论更新成功', comment: updatedComment });
  } catch (error) {
    console.error('更新评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除评论
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    // 检查评论是否存在
    const comment = await Comment.findByPk(id);
    if (!comment) {
      return res.status(404).json({ message: '评论不存在' });
    }

    // 验证是否为评论作者
    if (comment.userId !== userId) {
      return res.status(403).json({ message: '无权删除此评论' });
    }

    // 删除评论
    await comment.destroy();

    res.status(200).json({ message: '评论删除成功' });
  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  createComment,
  getCommentsByObjectiveId,
  updateComment,
  deleteComment
};
