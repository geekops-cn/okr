const Objective = require('../models/Objective');
const KeyResult = require('../models/KeyResult');
const User = require('../models/User');
const Department = require('../models/Department');
const { setCache, getCache, deleteCache, generateCacheKey, CACHE_DURATION } = require('../utils/cache');

// 创建目标
const createObjective = async (req, res) => {
  try {
    const { title, description, ownerId, priority, startDate, endDate } = req.body;

    const owner = await User.findByPk(ownerId);
    if (!owner) {
      return res.status(400).json({ message: '无效的所有者ID' });
    }

    const objective = await Objective.create({
      title,
      description,
      ownerId,
      priority,
      startDate,
      endDate
    });

    // 直接构造返回数据，避免二次查询
    const createdObjective = {
      ...objective.toJSON(),
      User: { id: owner.id, name: owner.name },
      KeyResults: []
    };

    // 清除缓存
    deleteCache(generateCacheKey('objectives', 'all'));

    res.status(201).json({ message: '目标创建成功', objective: createdObjective });
  } catch (error) {
    console.error('创建目标错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取所有目标
const getAllObjectives = async (req, res) => {
  try {
    // 生成缓存键
    const cacheKey = generateCacheKey('objectives', 'all');
    
    // 检查缓存
    const cachedObjectives = getCache(cacheKey);
    if (cachedObjectives) {
      return res.status(200).json({ objectives: cachedObjectives });
    }
    
    // 缓存未命中，查询数据库
    const objectives = await Objective.findAll({
      include: [
        { model: User, attributes: ['id', 'name'] },
        {
          model: KeyResult,
          include: [{ model: User, attributes: ['id', 'name'] }],
          attributes: {
            include: ['ownerId']
          }
        }
      ]
    });

    // 转换为普通对象并缓存
    const objectivesData = objectives.map(obj => obj.toJSON());
    setCache(cacheKey, objectivesData, CACHE_DURATION.MEDIUM);

    res.status(200).json({ objectives: objectivesData });
  } catch (error) {
    console.error('获取目标列表错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取单个目标详情
const getObjectiveById = async (req, res) => {
  try {
    const { id } = req.params;
    const objective = await Objective.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name'] },
        {
          model: KeyResult,
          include: [{ model: User, attributes: ['id', 'name'] }],
          attributes: {
            include: ['ownerId']
          }
        }
      ]
    });

    if (!objective) {
      return res.status(404).json({ message: '目标不存在' });
    }

    res.status(200).json({ objective });
  } catch (error) {
    console.error('获取目标详情错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 更新目标
const updateObjective = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, ownerId, priority, startDate, endDate, status } = req.body;

    // 检查目标是否存在并获取完整数据
    const objective = await Objective.findByPk(id, {
      include: [
        { model: User, attributes: ['id', 'name'] },
        {
          model: KeyResult,
          include: [{ model: User, attributes: ['id', 'name'] }],
          attributes: {
            include: ['ownerId']
          }
        }
      ]
    });

    if (!objective) {
      return res.status(404).json({ message: '目标不存在' });
    }

    // 验证所有者是否存在
    let owner = objective.User;
    if (ownerId && ownerId !== objective.ownerId) {
      owner = await User.findByPk(ownerId);
      if (!owner) {
        return res.status(400).json({ message: '无效的所有者ID' });
      }
    }

    // 更新目标
    await objective.update({
      title: title || objective.title,
      description: description || objective.description,
      ownerId: ownerId || objective.ownerId,
      priority: priority || objective.priority,
      startDate: startDate || objective.startDate,
      endDate: endDate || objective.endDate,
      status: status || objective.status
    });

    // 更新返回数据中的所有者信息
    const updatedObjective = objective.toJSON();
    if (ownerId && ownerId !== objective.ownerId) {
      updatedObjective.User = { id: owner.id, name: owner.name };
    }

    // 清除缓存
    deleteCache(generateCacheKey('objectives', 'all'));
    deleteCache(generateCacheKey('objective', id));

    res.status(200).json({ message: '目标更新成功', objective: updatedObjective });
  } catch (error) {
    console.error('更新目标错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 删除目标
const deleteObjective = async (req, res) => {
  try {
    const { id } = req.params;

    // 检查目标是否存在
    const objective = await Objective.findByPk(id);
    if (!objective) {
      return res.status(404).json({ message: '目标不存在' });
    }

    // 删除目标（会级联删除相关的关键结果和评论）
    await objective.destroy();

    // 清除缓存
    deleteCache(generateCacheKey('objectives', 'all'));
    deleteCache(generateCacheKey('objective', id));

    res.status(200).json({ message: '目标删除成功' });
  } catch (error) {
    console.error('删除目标错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  createObjective,
  getAllObjectives,
  getObjectiveById,
  updateObjective,
  deleteObjective
};
