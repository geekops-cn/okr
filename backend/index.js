const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const compression = require('express-compression');
const sequelize = require('./config/db');

// 加载环境变量
dotenv.config();

// 导入模型
const User = require('./models/User');
const Role = require('./models/Role');
const Department = require('./models/Department');
const Objective = require('./models/Objective');
const KeyResult = require('./models/KeyResult');
const Comment = require('./models/Comment');
const ObjectiveShare = require('./models/ObjectiveShare');
const Permission = require('./models/Permission');
const RolePermission = require('./models/RolePermission');
const ProgressHistory = require('./models/ProgressHistory');

// 定义模型关联
Role.hasMany(User, { foreignKey: 'roleId' });
User.belongsTo(Role, { foreignKey: 'roleId' });

Department.hasMany(User, { foreignKey: 'departmentId' });
User.belongsTo(Department, { foreignKey: 'departmentId', onDelete: 'SET NULL', onUpdate: 'CASCADE' });

Department.hasMany(Objective, { foreignKey: 'departmentId' });
Objective.belongsTo(Department, { foreignKey: 'departmentId' });

User.hasMany(Objective, { foreignKey: 'ownerId' });
Objective.belongsTo(User, { foreignKey: 'ownerId' });

Objective.hasMany(KeyResult, { foreignKey: 'objectiveId', onDelete: 'CASCADE' });
KeyResult.belongsTo(Objective, { foreignKey: 'objectiveId' });

// User与KeyResult的关联
User.hasMany(KeyResult, { foreignKey: 'ownerId' });
KeyResult.belongsTo(User, { foreignKey: 'ownerId' });

// 关键结果与进度历史记录关联
KeyResult.hasMany(ProgressHistory, { foreignKey: 'keyResultId', onDelete: 'CASCADE' });
ProgressHistory.belongsTo(KeyResult, { foreignKey: 'keyResultId' });

// 用户与进度历史记录关联
User.hasMany(ProgressHistory, { foreignKey: 'updatedBy' });
ProgressHistory.belongsTo(User, { foreignKey: 'updatedBy' });

Objective.hasMany(Comment, { foreignKey: 'objectiveId', onDelete: 'CASCADE' });
Comment.belongsTo(Objective, { foreignKey: 'objectiveId' });

User.hasMany(Comment, { foreignKey: 'userId' });
Comment.belongsTo(User, { foreignKey: 'userId' });

Objective.hasMany(ObjectiveShare, { foreignKey: 'objectiveId', onDelete: 'CASCADE' });
ObjectiveShare.belongsTo(Objective, { foreignKey: 'objectiveId' });

User.hasMany(ObjectiveShare, { foreignKey: 'userId' });
ObjectiveShare.belongsTo(User, { foreignKey: 'userId' });

Department.hasMany(ObjectiveShare, { foreignKey: 'departmentId' });
ObjectiveShare.belongsTo(Department, { foreignKey: 'departmentId' });

// 角色与权限关联
Role.belongsToMany(Permission, {
  through: RolePermission,
  foreignKey: 'roleId',
  otherKey: 'permissionId'
});
Permission.belongsToMany(Role, {
  through: RolePermission,
  foreignKey: 'permissionId',
  otherKey: 'roleId'
});

// 创建Express应用
const app = express();

// 中间件
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 测试路由
app.get('/', (req, res) => {
  res.json({ message: 'OKR系统后端API' });
});

// 认证路由
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// 目标路由
const objectiveRoutes = require('./routes/objectiveRoutes');
app.use('/api/objectives', objectiveRoutes);

// 关键结果路由
const keyResultRoutes = require('./routes/keyResultRoutes');
app.use('/api/key-results', keyResultRoutes);

// 评论路由
const commentRoutes = require('./routes/commentRoutes');
app.use('/api/comments', commentRoutes);

// 目标共享路由
const objectiveShareRoutes = require('./routes/objectiveShareRoutes');
app.use('/api/objective-shares', objectiveShareRoutes);

// 数据分析路由
const analyticsRoutes = require('./routes/analyticsRoutes');
app.use('/api/analytics', analyticsRoutes);

// 用户管理路由
const userRoutes = require('./routes/userRoutes');
app.use('/api', userRoutes);

// 权限管理路由
const permissionRoutes = require('./routes/permissionRoutes');
app.use('/api', permissionRoutes);

// 定义端口
const PORT = process.env.PORT || 3000;

// 导入初始数据填充函数
const seedInitialData = require('./seeders/initialData');

// 同步数据库并启动服务器
sequelize.sync({ force: true }).then(async () => {
  console.log('数据库同步成功');
  
  // 填充初始数据
  await seedInitialData();
  
  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('数据库同步失败:', err.message);
});
