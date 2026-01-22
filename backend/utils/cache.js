const cache = require('memory-cache');

// 缓存配置
const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5分钟
  MEDIUM: 15 * 60 * 1000, // 15分钟
  LONG: 30 * 60 * 1000 // 30分钟
};

// 设置缓存
const setCache = (key, value, duration = CACHE_DURATION.MEDIUM) => {
  cache.put(key, value, duration);
};

// 获取缓存
const getCache = (key) => {
  return cache.get(key);
};

// 删除缓存
const deleteCache = (key) => {
  cache.del(key);
};

// 清除所有缓存
const clearCache = () => {
  cache.clear();
};

// 生成缓存键
const generateCacheKey = (prefix, ...args) => {
  return `${prefix}:${args.join(':')}`;
};

module.exports = {
  setCache,
  getCache,
  deleteCache,
  clearCache,
  generateCacheKey,
  CACHE_DURATION
};