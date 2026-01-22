const { Sequelize } = require('sequelize');
const mysql2 = require('mysql2/promise');
require('dotenv').config();

// 数据库配置
const dbConfig = {
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
};

// 自动创建数据库的函数
const createDatabaseIfNotExists = async () => {
  try {
    // 创建一个不指定数据库的连接
    const connection = await mysql2.createConnection({
      host: dbConfig.host,
      port: dbConfig.port,
      user: dbConfig.user,
      password: dbConfig.password
    });

    // 创建数据库（如果不存在）
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${dbConfig.database}`);
    console.log(`数据库 ${dbConfig.database} 创建成功`);
    
    // 关闭连接
    await connection.end();
  } catch (error) {
    console.error('创建数据库失败:', error.message);
    throw error;
  }
};

// 创建Sequelize实例
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.user,
  dbConfig.password,
  {
    host: dbConfig.host,
    port: dbConfig.port,
    dialect: 'mysql',
    logging: console.log,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// 测试数据库连接
const testConnection = async () => {
  try {
    // 先尝试创建数据库
    await createDatabaseIfNotExists();
    
    // 然后连接数据库
    await sequelize.authenticate();
    console.log('数据库连接成功');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    console.error('请检查MySQL服务是否已启动，或检查数据库连接配置是否正确。');
  }
};

testConnection();

module.exports = sequelize;
