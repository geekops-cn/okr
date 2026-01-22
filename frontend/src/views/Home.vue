<template>
  <div class="home-container">
    <a-layout>
      <a-layout-header class="header">
        <div class="logo">
          <span class="logo-icon">🎯</span>
          <span class="logo-text">OKR系统</span>
        </div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :default-selected-keys="['1']"
          style="line-height: 64px"
          :breakpoint="'lg'"
          :collapsed-width="0"
        >
          <a-menu-item key="1" @click="navigateTo('Home')">
            <template #icon>
              <HomeOutlined />
            </template>
            首页
          </a-menu-item>
          <a-menu-item key="2" @click="navigateTo('OKRManagement')">
            <template #icon>
              <ProjectOutlined />
            </template>
            OKR管理
          </a-menu-item>
          <a-menu-item key="3" @click="navigateTo('Analytics')">
            <template #icon>
              <BarChartOutlined />
            </template>
            数据分析
          </a-menu-item>
          <a-menu-item key="4" @click="navigateTo('UserManagement')">
            <template #icon>
              <UserOutlined />
            </template>
            用户管理
          </a-menu-item>
          <a-menu-item key="5" @click="navigateTo('PermissionManagement')">
            <template #icon>
              <LockOutlined />
            </template>
            权限管理
          </a-menu-item>
          <a-menu-item key="6" @click="handleLogout">
            <template #icon>
              <LogoutOutlined />
            </template>
            退出登录
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout-content class="content">
        <div class="content-wrapper">
          <div class="welcome-section">
            <h1>欢迎使用OKR系统</h1>
            <p class="welcome-subtitle">高效管理目标，追踪进度，实现团队愿景</p>
          </div>
          
          <a-row :gutter="[16, 16]">
            <a-col :xs="24" :sm="12" :md="6">
              <a-card class="stats-card" title="我的目标" :bordered="false">
                <div class="card-icon primary-icon">
                  <FlagOutlined />
                </div>
                <p class="card-content">{{ objectiveCount }}</p>
                <a-button class="card-button" type="primary" @click="navigateTo('OKRManagement')">查看详情</a-button>
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card class="stats-card" title="已完成目标" :bordered="false">
                <div class="card-icon success-icon">
                  <CheckCircleOutlined />
                </div>
                <p class="card-content">{{ completedCount }}</p>
                <a-button class="card-button" @click="navigateTo('Analytics')">查看分析</a-button>
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card class="stats-card" title="进行中目标" :bordered="false">
                <div class="card-icon warning-icon">
                  <SyncOutlined spin />
                </div>
                <p class="card-content">{{ inProgressCount }}</p>
                <a-button class="card-button" @click="navigateTo('OKRManagement')">查看详情</a-button>
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="12" :md="6">
              <a-card class="stats-card" title="整体进度" :bordered="false">
                <div class="card-icon info-icon">
                  <PieChartOutlined />
                </div>
                <div class="progress-content">
                  <a-progress :percent="overallProgress" size="small" :status="getProgressStatus(overallProgress)" />
                  <span>{{ Math.round(overallProgress) }}%</span>
                </div>
                <a-button class="card-button" @click="navigateTo('Analytics')">查看分析</a-button>
              </a-card>
            </a-col>
          </a-row>
          
          <a-card class="recent-objectives-card" title="最近目标" :bordered="false">
            <div class="table-container">
              <a-table
                :columns="columns"
                :data-source="recentObjectives"
                :pagination="false"
                row-key="id"
                :scroll="{ x: 'max-content' }"
                class="recent-objectives-table"
              >
              </a-table>
            </div>
          </a-card>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore, useOKRStore } from '../store';
import { message } from 'ant-design-vue';
import {
  HomeOutlined,
  ProjectOutlined,
  BarChartOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  PieChartOutlined,
  FlagOutlined
} from '@ant-design/icons-vue';

const router = useRouter();
const userStore = useUserStore();
const okrStore = useOKRStore();

const objectiveCount = ref(0);
const completedCount = ref(0);
const inProgressCount = ref(0);
const overallProgress = ref(0);
const recentObjectives = ref([]);

const columns = [
  {
    title: '目标标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    customRender: ({ text }) => {
      return h('a-tag', {
        color: text === 'active' ? 'blue' :
              text === 'completed' ? 'green' : 'red'
      }, text)
    }
  },
  {
    title: '进度',
    key: 'progress',
    customRender: ({ record }) => {
      return h('a-progress', {
        percent: record.progress,
        size: 'small'
      })
    }
  },
  {
    title: '结束日期',
    dataIndex: 'endDate',
    key: 'endDate',
    customRender: ({ text }) => {
      if (text && !isNaN(new Date(text).getTime())) {
        return new Date(text).toLocaleDateString();
      }
      return '';
    }
  }
];

// 导航到指定页面
const navigateTo = (routeName) => {
  router.push({ name: routeName });
};

// 退出登录
const handleLogout = () => {
  userStore.logout();
  message.success('已退出登录');
  router.push({ name: 'Login' });
};

// 获取进度状态
const getProgressStatus = (progress) => {
  if (progress >= 100) return 'success';
  if (progress >= 60) return 'active';
  return 'normal';
};

// 获取OKR概览数据
const fetchOKROverview = async () => {
  try {
    // 获取所有目标
    const response = await fetch('http://localhost:3001/api/objectives', {
      headers: {
        'Authorization': userStore.token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      okrStore.setObjectives(data.objectives);
      
      // 计算统计数据
      objectiveCount.value = data.objectives.length;
      completedCount.value = data.objectives.filter(obj => obj.status === 'completed').length;
      inProgressCount.value = data.objectives.filter(obj => obj.status === 'active').length;
      
      // 计算整体进度
      let totalProgress = 0;
      const objectivesWithProgress = data.objectives.map(obj => {
        if (obj.KeyResults.length === 0) {
          return { ...obj, progress: 0 };
        }
        
        const krProgressSum = obj.KeyResults.reduce((sum, kr) => {
          const progress = (kr.currentValue / kr.targetValue) * 100;
          return sum + Math.min(progress, 100);
        }, 0);
        
        const progress = krProgressSum / obj.KeyResults.length;
        totalProgress += progress;
        return { ...obj, progress };
      });
      
      overallProgress.value = data.objectives.length > 0 ? totalProgress / data.objectives.length : 0;
      
      // 获取最近5个目标
      recentObjectives.value = objectivesWithProgress
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    }
  } catch (error) {
    console.error('获取OKR概览数据错误:', error);
    message.error('获取数据失败');
  }
};

onMounted(() => {
  fetchOKROverview();
});
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--spacing-xl);
  background-color: #001529;
  flex-shrink: 0;
  width: 100%;
  box-shadow: var(--shadow-md);
  transition: all 0.3s ease;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: white;
  font-size: var(--font-size-xl);
  font-weight: bold;
  margin-right: var(--spacing-xl);
  white-space: nowrap;
  transition: all 0.3s ease;
}

.logo-icon {
  font-size: var(--font-size-2xl);
  animation: pulse 2s infinite;
}

.logo-text {
  background: linear-gradient(90deg, #1890ff, #40a9ff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.content {
  background-color: var(--bg-tertiary);
  padding: var(--spacing-xl);
  min-height: calc(100vh - 64px);
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}

.content-wrapper {
  background-color: var(--bg-primary);
  padding: var(--spacing-xl);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-md);
  max-width: 100%;
  width: 100%;
  animation: slide-up 0.5s ease-out;
}

.welcome-section {
  margin-bottom: var(--spacing-2xl);
  text-align: center;
}

.welcome-section h1 {
  margin-top: 0;
  margin-bottom: var(--spacing-sm);
  color: var(--primary-color);
  font-size: clamp(var(--font-size-xl), 4vw, var(--font-size-3xl));
  font-weight: 700;
  animation: fade-in 0.8s ease-out;
}

.welcome-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-lg);
  animation: fade-in 1s ease-out;
}

.stats-card {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  animation: slide-up 0.6s ease-out;
}

.stats-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.card-icon {
  font-size: var(--font-size-2xl);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  border-radius: var(--border-radius-full);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.card-icon:hover {
  transform: scale(1.1);
}

.primary-icon {
  background-color: rgba(24, 144, 255, 0.1);
  color: var(--primary-color);
}

.success-icon {
  background-color: rgba(82, 196, 26, 0.1);
  color: var(--success-color);
}

.warning-icon {
  background-color: rgba(250, 173, 20, 0.1);
  color: var(--warning-color);
}

.info-icon {
  background-color: rgba(24, 144, 255, 0.1);
  color: var(--info-color);
}

.card-content {
  font-size: clamp(var(--font-size-xl), 5vw, var(--font-size-3xl));
  font-weight: bold;
  text-align: center;
  margin: var(--spacing-lg) 0;
  color: var(--primary-color);
  transition: all 0.3s ease;
}

.card-button {
  width: 100%;
  margin-top: var(--spacing-md);
  transition: all 0.3s ease;
  border-radius: var(--border-radius-md);
}

.card-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.progress-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: var(--spacing-lg) 0;
  gap: var(--spacing-md);
}

.progress-content span {
  font-weight: bold;
  color: var(--text-primary);
  min-width: 40px;
  text-align: right;
}

.recent-objectives-card {
  margin-top: var(--spacing-2xl);
  animation: slide-up 0.8s ease-out;
}

.recent-objectives-table {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--border-radius-lg);
}

:deep(.ant-layout) {
  width: 100%;
}

:deep(.ant-card) {
  width: 100%;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

:deep(.ant-card-body) {
  padding: var(--spacing-lg);
}

:deep(.ant-card-head) {
  border-bottom: 1px solid var(--border-color-light);
}

:deep(.ant-card-head-title) {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.ant-btn) {
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
}

:deep(.ant-btn:hover) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

:deep(.ant-menu-item) {
  transition: all 0.3s ease;
  border-radius: var(--border-radius-md);
  margin: 0 var(--spacing-xs);
}

:deep(.ant-menu-item:hover) {
  background-color: rgba(255, 255, 255, 0.1) !important;
}

:deep(.ant-menu-item-selected) {
  background-color: var(--primary-color) !important;
}

:deep(.ant-table) {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-color-light);
  transition: all 0.2s ease;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: rgba(24, 144, 255, 0.02);
}

:deep(.ant-progress) {
  flex: 1;
}

/* 动画定义 */
@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slide-up {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

/* 响应式设计 */
@media (max-width: 992px) {
  .header {
    padding: 0 var(--spacing-lg);
  }
  
  :deep(.ant-menu-horizontal) {
    line-height: 64px;
  }
  
  .content {
    padding: var(--spacing-lg);
  }
  
  .content-wrapper {
    padding: var(--spacing-lg);
  }
}

@media (max-width: 768px) {
  .content {
    padding: var(--spacing-md);
  }
  
  .content-wrapper {
    padding: var(--spacing-lg);
  }
  
  .header {
    padding: 0 var(--spacing-md);
    flex-wrap: wrap;
  }
  
  .logo {
    font-size: var(--font-size-lg);
    margin-right: var(--spacing-lg);
  }
  
  .logo-icon {
    font-size: var(--font-size-xl);
  }
  
  .card-content {
    font-size: clamp(var(--font-size-lg), 4vw, var(--font-size-2xl));
  }
  
  .card-button {
    width: 100%;
    margin-top: var(--spacing-sm);
  }
  
  :deep(.ant-card-head-title) {
    font-size: var(--font-size-base);
  }
  
  :deep(.ant-card-body) {
    padding: var(--spacing-md);
  }
  
  :deep(.ant-table) {
    font-size: var(--font-size-sm);
  }
  
  :deep(.ant-table-thead > tr > th) {
    white-space: nowrap;
    padding: var(--spacing-sm);
  }
  
  :deep(.ant-table-tbody > tr > td) {
    white-space: nowrap;
    padding: var(--spacing-sm);
  }
  
  .welcome-section h1 {
    font-size: var(--font-size-xl);
  }
  
  .welcome-subtitle {
    font-size: var(--font-size-base);
  }
}

@media (max-width: 576px) {
  .header {
    padding: 0 var(--spacing-sm);
  }
  
  .logo {
    font-size: var(--font-size-base);
    margin-right: var(--spacing-md);
  }
  
  .content {
    padding: var(--spacing-sm);
  }
  
  .content-wrapper {
    padding: var(--spacing-md);
    border-radius: var(--border-radius-lg);
  }
  
  .welcome-section h1 {
    font-size: var(--font-size-lg);
  }
  
  .card-content {
    font-size: var(--font-size-xl);
    margin: var(--spacing-md) 0;
  }
  
  .card-icon {
    font-size: var(--font-size-xl);
    padding: var(--spacing-sm);
  }
  
  :deep(.ant-card-head-title) {
    font-size: var(--font-size-sm);
  }
  
  :deep(.ant-card-body) {
    padding: var(--spacing-sm);
  }
  
  :deep(.ant-table) {
    font-size: var(--font-size-xs);
  }
  
  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: var(--spacing-xs);
  }
  
  :deep(.ant-menu-item) {
    margin: 0;
    padding: 0 var(--spacing-sm);
  }
}
</style>
