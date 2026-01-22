const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    // 获取Authorization头
    const authHeader = req.header('Authorization');
    if (!authHeader) {
      return res.status(401).json({ message: '未提供认证令牌' });
    }

    // 提取token
    const token = authHeader.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: '无效的认证令牌' });
    }

    // 验证token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: '无效的认证令牌' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: '认证令牌已过期' });
    }
    res.status(500).json({ message: '服务器错误' });
  }
};

module.exports = auth;
