<template>
  <div class="analytics-container">
    <a-layout>
      <a-layout-header class="header">
        <div class="logo">OKR系统</div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :default-selected-keys="['3']"
          style="line-height: 64px"
          :breakpoint="'lg'"
          :collapsed-width="0"
        >
          <a-menu-item key="1" @click="navigateTo('Home')">
            首页
          </a-menu-item>
          <a-menu-item key="2" @click="navigateTo('OKRManagement')">
            OKR管理
          </a-menu-item>
          <a-menu-item key="3" @click="navigateTo('Analytics')">
            数据分析
          </a-menu-item>
          <a-menu-item key="4" @click="navigateTo('UserManagement')">
            用户管理
          </a-menu-item>
          <a-menu-item key="5" @click="navigateTo('PermissionManagement')">
            权限管理
          </a-menu-item>
          <a-menu-item key="6" @click="handleLogout">
            退出登录
          </a-menu-item>
        </a-menu>
      </a-layout-header>
      <a-layout-content class="content">
        <div class="content-wrapper">
          <h1>数据分析</h1>
          
          <a-row :gutter="[16, 16]">
            <!-- 整体进度卡片 -->
            <a-col :span="24">
              <a-card title="整体OKR进度" :bordered="false">
                <div id="progress-chart" style="width: 100%; height: 300px;"></div>
              </a-card>
            </a-col>
            
            <!-- 状态分布和健康度评分 -->
            <a-col :xs="24" :sm="24" :md="12">
              <a-card title="目标状态分布" :bordered="false">
                <div id="status-chart" style="width: 100%; height: 300px;"></div>
              </a-card>
            </a-col>
            <a-col :xs="24" :sm="24" :md="12">
              <a-card title="健康度评分" :bordered="false">
                <div id="health-chart" style="width: 100%; height: 300px;"></div>
              </a-card>
            </a-col>
          </a-row>
          
          <!-- 部门统计数据 -->
          <a-card title="部门OKR统计" :bordered="false" style="margin-top: 16px;">
            <div class="table-container">
              <a-table
                :columns="departmentColumns"
                :data-source="departmentStats"
                :pagination="false"
                row-key="id"
                :scroll="{ x: 'max-content' }"
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
import { ref, onMounted, onUnmounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';
import { message } from 'ant-design-vue';
import * as echarts from 'echarts';

const router = useRouter();
const userStore = useUserStore();

const departmentStats = ref([]);
let progressChart = null;
let statusChart = null;
let healthChart = null;

// 部门统计列配置
const departmentColumns = [
  {
    title: '部门名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '目标数量',
    dataIndex: 'objectiveCount',
    key: 'objectiveCount'
  },
  {
    title: '平均进度',
    key: 'progress',
    customRender: ({ record }) => {
      return h('a-progress', { percent: record.avgProgress || 0, size: 'small' })
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

// 获取OKR进度数据
const fetchProgressData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/analytics/progress', {
      headers: {
        'Authorization': userStore.token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      renderProgressChart(data);
      renderStatusChart(data);
    } else {
      message.error('获取进度数据失败');
    }
  } catch (error) {
    console.error('获取进度数据错误:', error);
    message.error('获取进度数据失败');
  }
};

// 获取健康度数据
const fetchHealthData = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/analytics/health-score', {
      headers: {
        'Authorization': userStore.token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      renderHealthChart(data);
    } else {
      message.error('获取健康度数据失败');
    }
  } catch (error) {
    console.error('获取健康度数据错误:', error);
    message.error('获取健康度数据失败');
  }
};

// 获取部门统计数据
const fetchDepartmentStats = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/analytics/department-stats', {
      headers: {
        'Authorization': userStore.token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      departmentStats.value = data.departmentStats;
    } else {
      message.error('获取部门统计数据失败');
    }
  } catch (error) {
    console.error('获取部门统计数据错误:', error);
    message.error('获取部门统计数据失败');
  }
};

// 渲染进度图表
const renderProgressChart = (data) => {
  const chartDom = document.getElementById('progress-chart');
  if (!chartDom) return;
  
  if (progressChart) {
    progressChart.dispose();
  }
  
  progressChart = echarts.init(chartDom);
  
  const option = {
    title: {
      text: '整体OKR进度',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        name: 'OKR进度',
        type: 'gauge',
        radius: '70%',
        data: [{
          value: data.overallProgress,
          name: '整体进度'
        }],
        detail: {
          formatter: '{value}%'
        },
        axisLine: {
          lineStyle: {
            width: 20,
            color: [
              [0.3, '#FF6B6B'],
              [0.7, '#4ECDC4'],
              [1, '#45B7D1']
            ]
          }
        }
      }
    ]
  };
  
  progressChart.setOption(option);
};

// 渲染状态分布图表
const renderStatusChart = (data) => {
  const chartDom = document.getElementById('status-chart');
  if (!chartDom) return;
  
  if (statusChart) {
    statusChart.dispose();
  }
  
  statusChart = echarts.init(chartDom);
  
  const statusMap = {
    'active': '进行中',
    'completed': '已完成',
    'expired': '已过期'
  };
  
  const statusData = data.statusStats.map(item => ({
    name: statusMap[item.status] || item.status,
    value: item.count
  }));
  
  const option = {
    title: {
      text: '目标状态分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left',
      data: statusData.map(item => item.name)
    },
    series: [
      {
        name: '目标状态',
        type: 'pie',
        radius: '50%',
        data: statusData,
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };
  
  statusChart.setOption(option);
};

// 渲染健康度评分图表
const renderHealthChart = (data) => {
  const chartDom = document.getElementById('health-chart');
  if (!chartDom) return;
  
  if (healthChart) {
    healthChart.dispose();
  }
  
  healthChart = echarts.init(chartDom);
  
  const healthScoreData = data.healthScores.map(item => ({
    objectiveId: item.objectiveId,
    healthScore: item.healthScore
  }));
  
  const option = {
    title: {
      text: '目标健康度评分',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      }
    },
    xAxis: {
      type: 'category',
      data: healthScoreData.map(item => `目标 ${item.objectiveId}`)
    },
    yAxis: {
      type: 'value',
      name: '健康度评分',
      min: 0,
      max: 100
    },
    series: [
      {
        name: '健康度评分',
        type: 'bar',
        data: healthScoreData.map(item => item.healthScore),
        itemStyle: {
          color: function(params) {
            const colorList = [
              '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
              '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'
            ];
            return colorList[params.dataIndex % colorList.length];
          }
        }
      }
    ]
  };
  
  healthChart.setOption(option);
};

// 窗口大小变化时重绘图表
const handleResize = () => {
  progressChart?.resize();
  statusChart?.resize();
  healthChart?.resize();
};

onMounted(() => {
  fetchProgressData();
  fetchHealthData();
  fetchDepartmentStats();
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  progressChart?.dispose();
  statusChart?.dispose();
  healthChart?.dispose();
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.analytics-container {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  background-color: #001529;
  flex-shrink: 0;
  width: 100%;
}

.logo {
  color: white;
  font-size: 20px;
  font-weight: bold;
  margin-right: 24px;
  white-space: nowrap;
}

.content {
  background-color: #f0f2f5;
  padding: 16px;
  min-height: calc(100vh - 64px);
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}

.content-wrapper {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  width: 100%;
}

.content-wrapper h1 {
  margin-top: 0;
  margin-bottom: 16px;
  color: #1890ff;
  font-size: clamp(18px, 4vw, 24px);
}

.table-container {
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;
}

:deep(.ant-layout) {
  width: 100%;
}

:deep(.ant-card) {
  width: 100%;
  margin-bottom: 16px;
}

:deep(.ant-card-body) {
  padding: 16px;
}

/* 图表容器响应式 */
#progress-chart,
#status-chart,
#health-chart {
  width: 100% !important;
  height: 300px;
  min-height: 250px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .header {
    padding: 0 16px;
  }
  
  :deep(.ant-menu-horizontal) {
    line-height: 64px;
  }
  
  #progress-chart,
  #status-chart,
  #health-chart {
    height: 280px;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 8px;
  }
  
  .content-wrapper {
    padding: 12px;
  }
  
  .header {
    padding: 0 12px;
  }
  
  .logo {
    font-size: 18px;
    margin-right: 12px;
  }
  
  :deep(.ant-card) {
    margin-bottom: 12px;
  }
  
  :deep(.ant-card-body) {
    padding: 12px;
  }
  
  :deep(.ant-card-head-title) {
    font-size: 16px;
  }
  
  #progress-chart,
  #status-chart,
  #health-chart {
    height: 250px !important;
    min-height: 200px;
  }
  
  :deep(.ant-table) {
    font-size: 14px;
  }
  
  :deep(.ant-table-thead > tr > th) {
    white-space: nowrap;
    padding: 8px;
  }
  
  :deep(.ant-table-tbody > tr > td) {
    white-space: nowrap;
    padding: 8px;
  }
}

@media (max-width: 576px) {
  .header {
    padding: 0 8px;
  }
  
  .logo {
    font-size: 16px;
    margin-right: 8px;
  }
  
  .content {
    padding: 4px;
  }
  
  .content-wrapper {
    padding: 8px;
  }
  
  .content-wrapper h1 {
    font-size: 16px;
    text-align: center;
  }
  
  :deep(.ant-card-head-title) {
    font-size: 14px;
  }
  
  :deep(.ant-card-body) {
    padding: 8px;
  }
  
  #progress-chart,
  #status-chart,
  #health-chart {
    height: 200px !important;
    min-height: 180px;
  }
  
  :deep(.ant-table) {
    font-size: 12px;
  }
  
  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 4px;
  }
}

/* 确保图表在容器内正确显示 */
:deep(.ant-card-body > div[id$='-chart']) {
  width: 100% !important;
}
</style>
