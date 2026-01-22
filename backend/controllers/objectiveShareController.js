const ObjectiveShare = require('../models/ObjectiveShare');
const Objective = require('../models/Objective');
const User = require('../models/User');
const Department = require('../models/Department');

// 共享目标给用户或部门
const shareObjective = async (req, res) => {
  try {
    const { objectiveId, userId, departmentId, accessLevel } = req.body;

    // 验证目标是否存在
    const objective = await Objective.findByPk(objectiveId);
    if (!objective) {
      return res.status(400).json({ message: '无效的目标ID' });
    }

    // 验证用户或部门是否存在（至少提供一个）
    if (!userId && !departmentId) {
      return res.status(400).json({ message: '必须提供用户ID或部门ID' });
    }

    if (userId) {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(400).json({ message: '无效的用户ID' });
      }
    }

    if (departmentId) {
      const department = await Department.findByPk(departmentId);
      if (!department) {
        return res.status(400).json({ message: '无效的部门ID' });
      }
    }

    // 创建共享关系
    const share = await ObjectiveShare.create({
      objectiveId,
      userId,
      departmentId,
      accessLevel
    });

    res.status(201).json({ message: '目标共享成功', share });
  } catch (error) {
    console.error('共享目标错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取目标的共享列表
const getObjectiveShares = async (req, res) => {
  try {
    const { objectiveId } = req.params;

    // 验证目标是否存在
    const objective = await Objective.findByPk(objectiveId);
    if (!objective) {
      return res.status(400).json({ message: '无效的目标ID' });
    }

    // 获取共享关系
    const shares = await ObjectiveShare.findAll({
      where: { objectiveId },
      include: [
        { model: User, attributes: ['id', 'name'] },
        { model: Department, attributes: ['id', 'name'] }
      ]
    });

    res.status(200).json({ shares });
  } catch (error) {
    console.error('获取目标共享列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新目标共享权限
const updateObjectiveShare = async (req, res) => {
  try {
    const { id } = req.params;
    const { accessLevel } = req.body;

    // 检查共享关系是否存在
    const share = await ObjectiveShare.findByPk(id);
    if (!share) {
      return res.status(404).json({ message: '共享关系不存在' });
    }

    // 更新权限
    await share.update({ accessLevel });

    res.status(200).json({ message: '共享权限更新成功', share });
  } catch (error) {
    console.error('更新目标共享权限错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除目标共享关系
const deleteObjectiveShare = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查共享关系是否存在
    const share = await ObjectiveShare.findByPk(id);
    if (!share) {
      return res.status(404).json({ message: '共享关系不存在' });
    }

    // 删除共享关系
    await share.destroy();

    res.status(200).json({ message: '目标共享关系删除成功' });
  } catch (error) {
    console.error('删除目标共享关系错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  shareObjective,
  getObjectiveShares,
  updateObjectiveShare,
  deleteObjectiveShare
};
