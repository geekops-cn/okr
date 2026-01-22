const Objective = require('../models/Objective');
const KeyResult = require('../models/KeyResult');
const sequelize = require('../config/db');
const { Op } = require('sequelize');

// 获取OKR进展统计数据
const getOKRProgress = async (req, res) => {
  try {
    // 获取所有目标及其关键结果
    const objectives = await Objective.findAll({
      include: [{ model: KeyResult }]
    });

    // 计算整体进度
    let totalProgress = 0;
    const objectiveProgress = [];

    for (const objective of objectives) {
      if (objective.KeyResults.length === 0) {
        objectiveProgress.push({ objectiveId: objective.id, progress: 0 });
        continue;
      }

      // 计算单个目标的进度（基于关键结果的平均进度）
      let krProgressSum = 0;
      for (const kr of objective.KeyResults) {
        const krProgress = (kr.currentValue / kr.targetValue) * 100;
        krProgressSum += Math.min(krProgress, 100); // 最多100%
      }
      
      const objectiveProgressValue = krProgressSum / objective.KeyResults.length;
      objectiveProgress.push({ objectiveId: objective.id, progress: objectiveProgressValue });
      totalProgress += objectiveProgressValue;
    }

    const overallProgress = objectives.length > 0 ? totalProgress / objectives.length : 0;

    // 统计不同状态的目标数量
    const statusStats = await Objective.findAll({
      attributes: ['status', [sequelize.fn('COUNT', sequelize.col('id')), 'count']],
      group: ['status']
    });

    res.status(200).json({
      overallProgress,
      objectiveProgress,
      statusStats: statusStats.map(item => ({
        status: item.status,
        count: parseInt(item.dataValues.count)
      }))
    });
  } catch (error) {
    console.error('获取OKR进展数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取健康度评估数据
const getHealthScore = async (req, res) => {
  try {
    // 获取所有目标及其关键结果
    const objectives = await Objective.findAll({
      include: [{ model: KeyResult }]
    });

    const healthScores = [];
    let overallHealthScore = 0;

    for (const objective of objectives) {
      if (objective.KeyResults.length === 0) {
        healthScores.push({ objectiveId: objective.id, healthScore: 0, comment: '缺少关键结果' });
        continue;
      }

      // 计算单个目标的进度（基于关键结果的平均进度）
      let krProgressSum = 0;
      for (const kr of objective.KeyResults) {
        const krProgress = (kr.currentValue / kr.targetValue) * 100;
        krProgressSum += Math.min(krProgress, 100); // 最多100%
      }
      
      const objectiveProgressValue = krProgressSum / objective.KeyResults.length;

      // 计算健康度得分
      let healthScore = 100;
      let comment = '';

      // 检查关键结果数量（建议3-5个）
      const krCount = objective.KeyResults.length;
      if (krCount < 3) {
        healthScore -= 20;
        comment += '关键结果数量过少（建议3-5个）；';
      } else if (krCount > 5) {
        healthScore -= 10;
        comment += '关键结果数量过多（建议3-5个）；';
      }

      // 检查关键结果进度
      let completedKRs = 0;
      let atRiskKRs = 0;

      for (const kr of objective.KeyResults) {
        const progress = (kr.currentValue / kr.targetValue) * 100;
        if (progress >= 100) {
          completedKRs++;
        } else if (progress < 50) {
          atRiskKRs++;
        }
      }

      // 计算时间进度（基于当前时间与目标周期）
      const now = new Date();
      const totalDays = (objective.endDate - objective.startDate) / (1000 * 60 * 60 * 24);
      const elapsedDays = (now - objective.startDate) / (1000 * 60 * 60 * 24);
      const timeProgress = Math.min((elapsedDays / totalDays) * 100, 100);

      // 检查进度是否符合时间预期
      const avgKRProgress = objectiveProgressValue / 100;
      if (avgKRProgress < timeProgress / 100 * 0.7) {
        healthScore -= 30;
        comment += '进度落后于时间预期；';
      }

      // 检查是否有高风险关键结果
      if (atRiskKRs > objective.KeyResults.length * 0.5) {
        healthScore -= 20;
        comment += '超过一半的关键结果进度落后；';
      }

      // 确保得分在0-100之间
      healthScore = Math.max(0, Math.min(100, healthScore));

      if (!comment) {
        comment = '目标健康状况良好';
      }

      healthScores.push({ objectiveId: objective.id, healthScore, comment });
      overallHealthScore += healthScore;
    }

    const avgHealthScore = objectives.length > 0 ? overallHealthScore / objectives.length : 0;

    res.status(200).json({
      overallHealthScore: avgHealthScore,
      healthScores
    });
  } catch (error) {
    console.error('获取健康度评估数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

// 获取部门OKR统计数据
const getDepartmentStats = async (req, res) => {
  try {
    const departmentStats = await sequelize.query(
      `
      SELECT 
        d.id, 
        d.name, 
        COUNT(o.id) as objectiveCount, 
        AVG(o.progress) as avgProgress 
      FROM 
        Departments d 
      LEFT JOIN 
        Objectives o ON d.id = o.departmentId 
      GROUP BY 
        d.id, d.name
      `,
      { type: sequelize.QueryTypes.SELECT }
    );

    res.status(200).json({ departmentStats });
  } catch (error) {
    console.error('获取部门统计数据错误:', error);
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = {
  getOKRProgress,
  getHealthScore,
  getDepartmentStats
};
