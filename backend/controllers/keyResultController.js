const KeyResult = require('../models/KeyResult');
const Objective = require('../models/Objective');
const ProgressHistory = require('../models/ProgressHistory');
const User = require('../models/User');

// 创建关键结果
const createKeyResult = async (req, res) => {
  try {
    const { objectiveId, title, description, targetValue, unit, ownerId } = req.body;

    // 验证目标是否存在
    const objective = await Objective.findByPk(objectiveId);
    if (!objective) {
      return res.status(400).json({ message: '无效的目标ID' });
    }

    // 创建关键结果
    const keyResult = await KeyResult.create({
      objectiveId,
      title,
      description,
      targetValue,
      unit,
      ownerId
    });

    // 直接构造返回数据，避免二次查询
    const createdKeyResult = {
      ...keyResult.toJSON()
    };

    // 如果有所有者ID，获取所有者信息
    if (ownerId) {
      const owner = await User.findByPk(ownerId, { attributes: ['id', 'name'] });
      if (owner) {
        createdKeyResult.User = owner.toJSON();
      }
    }

    res.status(201).json({ message: '关键结果创建成功', keyResult: createdKeyResult });
  } catch (error) {
    console.error('创建关键结果错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新关键结果
const updateKeyResult = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetValue, unit, ownerId } = req.body;

    // 检查关键结果是否存在并获取完整数据
    const keyResult = await KeyResult.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'name'] }]
    });

    if (!keyResult) {
      return res.status(404).json({ message: '关键结果不存在' });
    }

    // 更新关键结果
    await keyResult.update({
      title: title || keyResult.title,
      description: description || keyResult.description,
      targetValue: targetValue || keyResult.targetValue,
      unit: unit || keyResult.unit,
      ownerId: ownerId !== undefined ? ownerId : keyResult.ownerId
    });

    // 更新返回数据中的所有者信息
    const updatedKeyResult = keyResult.toJSON();
    if (ownerId !== undefined && ownerId !== keyResult.ownerId) {
      if (ownerId) {
        const owner = await User.findByPk(ownerId, { attributes: ['id', 'name'] });
        if (owner) {
          updatedKeyResult.User = owner.toJSON();
        } else {
          updatedKeyResult.User = null;
        }
      } else {
        updatedKeyResult.User = null;
      }
    }

    res.status(200).json({ message: '关键结果更新成功', keyResult: updatedKeyResult });
  } catch (error) {
    console.error('更新关键结果错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新关键结果进度
const updateKeyResultProgress = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentValue, description } = req.body;
    const updatedBy = req.user.userId; // 从认证中间件获取当前用户ID

    // 检查关键结果是否存在
    const keyResult = await KeyResult.findByPk(id);
    if (!keyResult) {
      return res.status(404).json({ message: '关键结果不存在' });
    }

    // 保存旧值用于历史记录
    const previousValue = keyResult.currentValue;

    // 更新进度
    await keyResult.update({ currentValue });

    // 更新状态
    let status = 'not_started';
    if (currentValue === 0) {
      status = 'not_started';
    } else if (currentValue < keyResult.targetValue) {
      status = 'in_progress';
    } else {
      status = 'completed';
    }

    await keyResult.update({ status });

    // 保存进度历史记录
    await ProgressHistory.create({
      keyResultId: id,
      currentValue,
      previousValue,
      description,
      updatedBy
    });

    res.status(200).json({ message: '进度更新成功', keyResult });
  } catch (error) {
    console.error('更新关键结果进度错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除关键结果
const deleteKeyResult = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查关键结果是否存在
    const keyResult = await KeyResult.findByPk(id);
    if (!keyResult) {
      return res.status(404).json({ message: '关键结果不存在' });
    }

    // 删除关键结果
    await keyResult.destroy();

    res.status(200).json({ message: '关键结果删除成功' });
  } catch (error) {
    console.error('删除关键结果错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取关键结果的进度历史记录
const getKeyResultProgressHistory = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查关键结果是否存在
    const keyResult = await KeyResult.findByPk(id);
    if (!keyResult) {
      return res.status(404).json({ message: '关键结果不存在' });
    }

    // 获取进度历史记录，按创建时间倒序排列
    const progressHistory = await ProgressHistory.findAll({
      where: { keyResultId: id },
      include: [
        {
          model: User,
          attributes: ['id', 'name', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.status(200).json({ message: '获取进度历史记录成功', progressHistory });
  } catch (error) {
    console.error('获取进度历史记录错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  createKeyResult,
  updateKeyResult,
  updateKeyResultProgress,
  deleteKeyResult,
  getKeyResultProgressHistory
};
