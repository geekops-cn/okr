<template>
  <div class="okr-management-container">
    <a-layout>
      <a-layout-header class="header">
        <div class="logo">
          <span class="logo-icon">🎯</span>
          <span class="logo-text">OKR系统</span>
        </div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :default-selected-keys="['2']"
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
          <div class="header-actions">
            <div class="header-title">
              <h1>OKR管理</h1>
              <p class="header-subtitle">管理您的目标和关键结果</p>
            </div>
            <a-button class="primary-button" type="primary" @click="showObjectiveModal = true">
              <template #icon>
                <PlusOutlined />
              </template>
              新建目标
            </a-button>
          </div>
          
          <!-- 目标列表 -->
          <a-card class="objectives-card" title="目标列表" :bordered="false">
            <div class="table-container">
              <a-table
                :columns="objectiveColumns"
                :data-source="objectivesWithProgress"
                :pagination="false"
                row-key="id"
                :scroll="{ x: 'max-content' }"
                class="objectives-table"
              >
              </a-table>
              <div v-if="objectivesWithProgress.length === 0" class="empty-state">
                <div class="empty-icon">🎯</div>
                <p class="empty-text">暂无目标</p>
                <a-button type="primary" @click="showObjectiveModal = true">
                  <template #icon>
                    <PlusOutlined />
                  </template>
                  新建第一个目标
                </a-button>
              </div>
            </div>
          </a-card>
          
          <!-- 关键结果管理 -->
          <a-card 
            class="key-results-card" 
            v-if="selectedObjective" 
            :bordered="false"
          >
            <div class="kr-header">
              <div class="kr-title">
                <h3>{{ selectedObjective.title }} - 关键结果</h3>

              </div>
              <a-button class="primary-button" type="primary" @click="showKRModal = true">
                <template #icon>
                  <PlusOutlined />
                </template>
                新建关键结果
              </a-button>
            </div>
            <div class="table-container">
              <a-table
                :columns="krColumns"
                :data-source="selectedObjective.KeyResults"
                :pagination="false"
                row-key="id"
                :scroll="{ x: 'max-content' }"
                class="key-results-table"
              >
              </a-table>
              <div v-if="selectedObjective.KeyResults.length === 0" class="empty-state">
                <div class="empty-icon">📊</div>
                <p class="empty-text">暂无关键结果</p>
                <a-button type="primary" @click="showKRModal = true">
                  <template #icon>
                    <PlusOutlined />
                  </template>
                  新建关键结果
                </a-button>
              </div>
            </div>
          </a-card>
        </div>
      </a-layout-content>
    </a-layout>
    
    <!-- 目标模态框 -->
    <a-modal
      v-model:open="showObjectiveModal"
      :title="objectiveForm.id ? '编辑目标' : '新建目标'"
      @ok="handleSaveObjective"
      @cancel="resetObjectiveForm"
      :width="{ 'xs': '90%', 'sm': 600, 'md': 600 }"
      class="custom-modal"
    >
      <a-form
        :model="objectiveForm"
        :rules="objectiveRules"
        layout="vertical"
        class="modal-form"
      >
        <a-form-item name="title" label="目标标题">
          <a-input 
            v-model:value="objectiveForm.title" 
            placeholder="请输入目标标题" 
            class="form-input"
          />
        </a-form-item>
        <a-form-item name="description" label="目标描述">
          <a-textarea 
            v-model:value="objectiveForm.description" 
            placeholder="请输入目标描述" 
            rows="3" 
            class="form-textarea"
          />
        </a-form-item>
        <a-form-item name="ownerId" label="负责人">
          <a-select 
            v-model:value="objectiveForm.ownerId" 
            placeholder="请选择负责人"
            class="form-select"
          >
            <a-select-option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }} ({{ user.username }})
            </a-select-option>
          </a-select>
        </a-form-item>


        <a-form-item name="startDate" label="开始日期">
          <a-date-picker 
            v-model:value="objectiveForm.startDate" 
            style="width: 100%" 
            format="YYYY-MM-DD"
            placeholder="请选择开始日期"
            :allow-clear="true"
            class="form-datepicker"
          />
        </a-form-item>
        <a-form-item name="endDate" label="结束日期">
          <a-date-picker 
            v-model:value="objectiveForm.endDate" 
            style="width: 100%" 
            format="YYYY-MM-DD"
            placeholder="请选择结束日期"
            :allow-clear="true"
            class="form-datepicker"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    
    <!-- 关键结果模态框 -->
    <a-modal
      v-model:open="showKRModal"
      :title="krForm.id ? '编辑关键结果' : '新建关键结果'"
      @ok="handleSaveKR"
      @cancel="resetKRForm"
      :width="{ 'xs': '90%', 'sm': 600, 'md': 600 }"
      class="custom-modal"
    >
      <a-form
        :model="krForm"
        :rules="krRules"
        layout="vertical"
        class="modal-form"
      >
        <a-form-item name="title" label="关键结果标题">
          <a-input 
            v-model:value="krForm.title" 
            placeholder="请输入关键结果标题" 
            class="form-input"
          />
        </a-form-item>
        <a-form-item name="description" label="关键结果描述">
          <a-textarea 
            v-model:value="krForm.description" 
            placeholder="请输入关键结果描述" 
            rows="3" 
            class="form-textarea"
          />
        </a-form-item>
        <a-form-item name="ownerId" label="KR负责人">
          <a-select 
            v-model:value="krForm.ownerId" 
            placeholder="请选择KR负责人"
            class="form-select"
          >
            <a-select-option v-for="user in users" :key="user.id" :value="user.id">
              {{ user.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="目标值与单位">
          <div class="form-row">
            <div class="form-row-item">
              <a-form-item name="targetValue" no-style>
                <a-input-number 
                  v-model:value="krForm.targetValue" 
                  placeholder="请输入目标值" 
                  class="form-input-number"
                  style="width: 100%"
                />
              </a-form-item>
            </div>
            <div class="form-row-item unit-item">
              <a-form-item name="unit" no-style>
                <a-input 
                  v-model:value="krForm.unit" 
                  placeholder="请输入单位" 
                  class="form-input"
                  style="width: 100%"
                />
              </a-form-item>
            </div>
          </div>
        </a-form-item>

      </a-form>
    </a-modal>
    
    <!-- 进度更新模态框 -->
    <a-modal
      v-model:open="showProgressModal"
      title="更新关键结果进度"
      @ok="handleUpdateProgress"
      @cancel="resetProgressForm"
      :width="{ 'xs': '90%', 'sm': 400, 'md': 400 }"
      class="custom-modal"
    >
      <a-form
        :model="progressForm"
        :rules="progressRules"
        layout="vertical"
        class="modal-form"
      >
        <a-form-item name="currentValue" label="当前值">
          <a-input-number 
            v-model:value="progressForm.currentValue" 
            placeholder="请输入当前值" 
            class="form-input-number"
          />
        </a-form-item>
        <a-form-item name="description" label="进度说明">
          <div class="rich-text-editor">
            <Toolbar
              :editor="editorRef"
              :default-config="{}"
              mode="default"
              style="border-bottom: 1px solid #e8e8e8"
            />
            <Editor
              v-model="progressForm.description"
              :ref="editorRef"
              :default-config="editorConfig"
              mode="default"
              style="height: 200px; overflow: auto"
              @onChange="handleEditorChange"
            />
          </div>
        </a-form-item>
        <div v-if="currentKR" class="progress-info">
          <div class="progress-details">
            <p>目标值: {{ currentKR.targetValue }} {{ currentKR.unit }}</p>
            <p>当前进度: {{ Math.min((progressForm.currentValue / currentKR.targetValue) * 100, 100).toFixed(1) }}%</p>
          </div>
          <a-progress 
            :percent="Math.min((progressForm.currentValue / currentKR.targetValue) * 100, 100)" 
            :status="getProgressStatus(Math.min((progressForm.currentValue / currentKR.targetValue) * 100, 100))"
          />
        </div>
      </a-form>
    </a-modal>
    
    <!-- 进度历史记录模态框 -->
    <a-modal
      v-model:open="showProgressHistoryModal"
      title="进度历史记录"
      @cancel="() => showProgressHistoryModal = false"
      :width="{ 'xs': '90%', 'sm': 600, 'md': 800 }"
      class="custom-modal"
    >
      <div v-if="progressHistory.length === 0" class="empty-state">
        <div class="empty-icon">📝</div>
        <p class="empty-text">暂无进度记录</p>
      </div>
      <div v-else class="progress-history-container">
        <a-timeline mode="alternate" class="progress-timeline">
          <a-timeline-item
            v-for="(history, index) in progressHistory"
            :key="history.id"
            :color="index === 0 ? 'blue' : 'green'"
          >
            <div class="timeline-content">
              <div class="timeline-header">
                <div class="timeline-info">
                  <span class="update-time">{{ new Date(history.createdAt).toLocaleString() }}</span>
                  <span class="update-user">- {{ history.User.name }} ({{ history.User.username }})</span>
                </div>
                <div class="progress-values">
                  <span class="previous-value">旧值: {{ history.previousValue }} {{ currentKR?.unit || '' }}</span>
                  <span class="current-value">新值: {{ history.currentValue }} {{ currentKR?.unit || '' }}</span>
                </div>
              </div>
              <div class="progress-delta">
                <span :class="{'delta-positive': history.currentValue > history.previousValue, 'delta-negative': history.currentValue < history.previousValue}">
                  {{ history.currentValue > history.previousValue ? '+' : '' }}{{ (history.currentValue - history.previousValue).toFixed(1) }} {{ currentKR?.unit || '' }}
                </span>
              </div>
              <div v-if="history.description" class="progress-description" v-html="history.description"></div>
              <div v-else class="progress-description empty-description">无进度说明</div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore, useOKRStore } from '../store';
import { message } from 'ant-design-vue';
import {
  PlusOutlined,
  HomeOutlined,
  ProjectOutlined,
  BarChartOutlined,
  UserOutlined,
  LockOutlined,
  LogoutOutlined,
  EditOutlined,
  DeleteOutlined,
  BarChartOutlined as BarChart2Outlined,
  SyncOutlined
} from '@ant-design/icons-vue';
import { Editor, Toolbar } from '@wangeditor/editor-for-vue';
import '@wangeditor/editor/dist/css/style.css';
import axios from 'axios';
import dayjs from 'dayjs';

const router = useRouter();
const userStore = useUserStore();
const okrStore = useOKRStore();

const objectivesWithProgress = computed(() => {
  return okrStore.objectives.map(obj => {
    if (obj.KeyResults.length === 0) {
      return { ...obj, progress: 0 };
    }
    
    const krProgressSum = obj.KeyResults.reduce((sum, kr) => {
      const progress = kr?.targetValue > 0 ? (kr?.currentValue / kr.targetValue) * 100 : 0;
      return sum + Math.min(progress, 100);
    }, 0);
    
    return { ...obj, progress: krProgressSum / obj.KeyResults.length };
  });
});

const selectedObjective = ref(null);
const showObjectiveModal = ref(false);
const showKRModal = ref(false);
const showProgressModal = ref(false);
const showProgressHistoryModal = ref(false);
const currentKR = ref(null);
const users = ref([]);
const progressHistory = ref([]);

// 目标表单
const objectiveForm = ref({
  id: null,
  title: '',
  description: '',
  ownerId: userStore.userInfo.id || 1,
  startDate: null,
  endDate: null
});

// 目标表单规则
const objectiveRules = {
  title: [{ required: true, message: '请输入目标标题', trigger: 'blur' }],
  ownerId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }]
};

// 关键结果表单
const krForm = ref({
  id: null,
  title: '',
  description: '',
  targetValue: 0,
  unit: '',
  ownerId: userStore.userInfo.id || 1
});

// 关键结果表单规则
const krRules = {
  title: [{ required: true, message: '请输入关键结果标题', trigger: 'blur' }],
  ownerId: [{ required: true, message: '请选择负责人', trigger: 'change' }],
  targetValue: [{ required: true, message: '请输入目标值', trigger: 'blur' }],
  unit: [{ required: true, message: '请输入单位', trigger: 'blur' }]
};

// 进度更新表单
const progressForm = ref({
  currentValue: 0,
  description: ''
});

// 进度更新表单规则
const progressRules = {
  currentValue: [{ required: true, message: '请输入当前值', trigger: 'blur' }]
};

// 编辑器实例
const editorRef = ref(null);

// 编辑器配置
const editorConfig = {
  placeholder: '请输入进度说明...',
  maxLength: 500
};

// 编辑器内容变化处理
const handleEditorChange = (editor) => {
  progressForm.value.description = editor.getHtml();
};

// 目标列配置
const objectiveColumns = [
  {
    title: '目标标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: '负责人',
    dataIndex: 'User',
    key: 'owner',
    customRender: ({ text, record }) => {
      return record.User ? record.User.name : '';
    }
  },
  {
    title: 'KR数量',
    key: 'krCount',
    customRender: ({ record }) => {
      return record.KeyResults ? record.KeyResults.length : 0;
    }
  },
  {
    title: '进度',
    key: 'progress',
    customRender: ({ record }) => {
      let progress = 0;
      if (record.KeyResults && record.KeyResults.length > 0) {
        const totalCount = record.KeyResults.length;
        const completedCount = record.KeyResults.filter(kr => kr.status === 'completed').length;
        progress = (completedCount / totalCount) * 100;
      }
      return h('a-progress', {
        percent: progress,
        size: 'small'
      })
    }
  },
  {
    title: '开始日期',
    dataIndex: 'startDate',
    key: 'startDate',
    customRender: ({ text }) => {
      if (text && !isNaN(new Date(text).getTime())) {
        return new Date(text).toLocaleDateString();
      }
      return '';
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
  },
  {
        title: '操作',
        key: 'action',
        customRender: ({ record }) => {
          return h('a-space', { 
            direction: 'horizontal',
            size: 'small'
          }, [
            h('a-button', {
              type: 'default',
              size: 'small',
              icon: h(BarChart2Outlined),
              onClick: () => handleViewKeyResults(record),
              class: 'action-button kr-button'
            }, '关键结果'),
            h('a-button', {
              type: 'primary',
              size: 'small',
              icon: h(EditOutlined),
              onClick: () => handleEditObjective(record),
              class: 'action-button edit-button'
            }, '编辑'),
            h('a-button', {
              danger: true,
              size: 'small',
              icon: h(DeleteOutlined),
              onClick: () => handleDeleteObjective(record.id),
              class: 'action-button delete-button'
            }, '删除')
          ])
        }
      }
];

// 关键结果列配置
const krColumns = [
  {
    title: '关键结果标题',
    dataIndex: 'title',
    key: 'title'
  },
  {
    title: 'KR负责人',
    dataIndex: 'ownerId',
    key: 'owner',
    customRender: ({ text, record }) => {
      // 首先尝试从record.User中获取用户名
      if (record.User) {
        return record.User.name;
      }
      // 然后尝试从text（即ownerId）中查找对应的用户名
      if (text) {
        const user = users.value.find(u => u.id === text);
        return user ? user.name : text;
      }
      // 最后，如果都没有，返回空字符串
      return '';
    }
  },
  {
    title: '当前值',
    dataIndex: 'currentValue',
    key: 'currentValue',
    customRender: ({ text, record }) => record ? `${text} ${record.unit || ''}` : ''
  },
  {
    title: '目标值',
    dataIndex: 'targetValue',
    key: 'targetValue',
    customRender: ({ text, record }) => record ? `${text} ${record.unit || ''}` : ''
  },

  {
    title: '进度',
    key: 'progress',
    customRender: ({ record }) => {
      if (!record) return '';
      const progress = record.targetValue > 0 ? Math.min((record.currentValue / record.targetValue) * 100, 100) : 0;
      return h('a-progress', {
        percent: progress,
        size: 'small'
      })
    }
  },

  {      title: '操作',      key: 'action',      customRender: ({ record }) => {        return h('a-space', null, [          h('a-button', {            type: 'default',            size: 'small',            icon: h(SyncOutlined),            onClick: () => handleUpdateKRProgress(record),            class: 'action-button progress-button'          }, '更新进度'),          h('a-button', {            type: 'default',            size: 'small',            icon: h(BarChart2Outlined),            onClick: () => handleViewProgressHistory(record),            class: 'action-button history-button'          }, '查看进度'),          h('a-button', {            danger: true,            size: 'small',            icon: h(DeleteOutlined),            onClick: () => handleDeleteKR(record.id),            class: 'action-button delete-button'          }, '删除')        ])      }    }
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

// 获取所有目标
const fetchObjectives = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/objectives', {
      headers: {
        'Authorization': userStore.token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('从后端返回的数据:', data);
      okrStore.setObjectives(data.objectives);
      
      // 更新selectedObjective引用，确保显示最新的关键结果
      if (selectedObjective.value) {
        const updatedObjective = okrStore.objectives.find(obj => obj.id === selectedObjective.value.id);
        if (updatedObjective) {
          selectedObjective.value = updatedObjective;
        }
      }
    }
  } catch (error) {
    console.error('获取目标列表错误:', error);
    message.error('获取目标列表失败');
  }
};

// 获取用户列表
const fetchUsers = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/users', {
      headers: {
        'Authorization': userStore.token
      }
    });
    users.value = response.data;
  } catch (error) {
    console.error('获取用户列表错误:', error);
    message.error('获取用户列表失败');
  }
};

// 重置目标表单
const resetObjectiveForm = () => {
  objectiveForm.value = {
    id: null,
    title: '',
    description: '',
    ownerId: userStore.userInfo.id || 1,
    priority: 'medium',
    startDate: null,
    endDate: null
  };
};

// 保存目标
const handleSaveObjective = async () => {
  try {
    let response;
    
    // 处理日期格式，转换为ISO字符串
    const objectiveData = {
      ...objectiveForm.value,
      startDate: objectiveForm.value.startDate 
        ? (typeof objectiveForm.value.startDate === 'string' 
            ? objectiveForm.value.startDate 
            : objectiveForm.value.startDate.toISOString()) 
        : null,
      endDate: objectiveForm.value.endDate 
        ? (typeof objectiveForm.value.endDate === 'string' 
            ? objectiveForm.value.endDate 
            : objectiveForm.value.endDate.toISOString()) 
        : null
    };
    
    delete objectiveData.departmentId;
    
    if (objectiveForm.value.id) {
      // 更新目标
      response = await fetch(`http://localhost:3001/api/objectives/${objectiveForm.value.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': userStore.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(objectiveData)
      });
    } else {
      // 创建目标
      response = await fetch('http://localhost:3001/api/objectives', {
        method: 'POST',
        headers: {
          'Authorization': userStore.token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(objectiveData)
      });
    }
    
    if (response.ok) {
      message.success(objectiveForm.value.id ? '目标更新成功' : '目标创建成功');
      showObjectiveModal.value = false;
      resetObjectiveForm();
      fetchObjectives();
    } else {
      const data = await response.json();
      message.error(data.message || '操作失败');
    }
  } catch (error) {
    console.error('保存目标错误:', error);
    message.error('操作失败');
  }
};

// 编辑目标
const handleEditObjective = (record) => {
  const { departmentId, ...recordWithoutDepartment } = record;
  objectiveForm.value = {
    ...recordWithoutDepartment,
    startDate: (record.startDate && !isNaN(new Date(record.startDate).getTime())) 
      ? dayjs(record.startDate) 
      : null,
    endDate: (record.endDate && !isNaN(new Date(record.endDate).getTime())) 
      ? dayjs(record.endDate) 
      : null
  };
  showObjectiveModal.value = true;
};

// 删除目标
const handleDeleteObjective = async (objectiveId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/objectives/${objectiveId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': userStore.token
      }
    });
    
    if (response.ok) {
      message.success('目标删除成功');
      fetchObjectives();
    } else {
      const data = await response.json();
      message.error(data.message || '删除失败');
    }
  } catch (error) {
    console.error('删除目标错误:', error);
    message.error('删除失败');
  }
};

// 查看关键结果
const handleViewKeyResults = (record) => {
  selectedObjective.value = record;
};

// 重置关键结果表单
const resetKRForm = () => {
  krForm.value = {
    id: null,
    title: '',
    description: '',
    targetValue: 0,
    unit: '',
    ownerId: userStore.userInfo.id || 1
  };
};

// 保存关键结果
const handleSaveKR = async () => {
  if (!selectedObjective.value) {
    message.error('请先选择一个目标');
    return;
  }
  
  try {
    const krData = {
      ...krForm.value,
      objectiveId: selectedObjective.value.id
    };
    
    const response = await fetch('http://localhost:3001/api/key-results', {
      method: 'POST',
      headers: {
        'Authorization': userStore.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(krData)
    });
    
    if (response.ok) {
      message.success('关键结果创建成功');
      showKRModal.value = false;
      resetKRForm();
      fetchObjectives();
    } else {
      const data = await response.json();
      message.error(data.message || '操作失败');
    }
  } catch (error) {
    console.error('保存关键结果错误:', error);
    message.error('操作失败');
  }
};

// 删除关键结果
const handleDeleteKR = async (krId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/key-results/${krId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': userStore.token
      }
    });
    
    if (response.ok) {
      message.success('关键结果删除成功');
      fetchObjectives();
    } else {
      const data = await response.json();
      message.error(data.message || '删除失败');
    }
  } catch (error) {
    console.error('删除关键结果错误:', error);
    message.error('删除失败');
  }
};

// 更新关键结果进度
const handleUpdateKRProgress = (record) => {
  currentKR.value = record;
  progressForm.value.currentValue = record.currentValue;
  showProgressModal.value = true;
};

// 重置进度表单
const resetProgressForm = () => {
  progressForm.value.currentValue = 0;
  progressForm.value.description = '';
  currentKR.value = null;
  // 重置编辑器内容
  if (editorRef.value) {
    const editor = editorRef.value;
    editor.clear();
  }
};

// 更新进度
const handleUpdateProgress = async () => {
  if (!currentKR.value) {
    message.error('请先选择一个关键结果');
    return;
  }
  
  try {
    const response = await fetch(`http://localhost:3001/api/key-results/${currentKR.value.id}/progress`, {
      method: 'PUT',
      headers: {
        'Authorization': userStore.token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        currentValue: progressForm.value.currentValue,
        description: progressForm.value.description
      })
    });
    
    if (response.ok) {
      message.success('进度更新成功');
      showProgressModal.value = false;
      resetProgressForm();
      fetchObjectives();
    } else {
      const data = await response.json();
      message.error(data.message || '更新失败');
    }
  } catch (error) {
    console.error('更新进度错误:', error);
    message.error('更新失败');
  }
};

// 获取进度历史记录
const fetchProgressHistory = async (krId) => {
  try {
    const response = await fetch(`http://localhost:3001/api/key-results/${krId}/progress-history`, {
      headers: {
        'Authorization': userStore.token
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      progressHistory.value = data.progressHistory;
    } else {
      const data = await response.json();
      message.error(data.message || '获取进度历史失败');
    }
  } catch (error) {
    console.error('获取进度历史错误:', error);
    message.error('获取进度历史失败');
  }
};

// 打开进度历史记录模态框
const handleViewProgressHistory = (record) => {
  currentKR.value = record;
  fetchProgressHistory(record.id);
  showProgressHistoryModal.value = true;
};

onMounted(() => {
  fetchObjectives();
  fetchUsers();
});
</script>

<style scoped>
.okr-management-container {
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

.header-actions {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-xl);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.header-title {
  flex: 1;
  min-width: 200px;
}

.header-title h1 {
  margin: 0;
  color: var(--primary-color);
  font-size: clamp(var(--font-size-xl), 4vw, var(--font-size-3xl));
  font-weight: 700;
  margin-bottom: var(--spacing-xs);
}

.header-subtitle {
  margin: 0;
  color: var(--text-secondary);
  font-size: var(--font-size-base);
}

.primary-button {
  transition: all 0.3s ease;
  border-radius: var(--border-radius-md);
  box-shadow: var(--shadow-sm);
}

.primary-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.kr-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--spacing-lg);
  flex-wrap: wrap;
  gap: var(--spacing-lg);
}

.kr-title {
  flex: 1;
  min-width: 200px;
}

.kr-title h3 {
  margin: 0;
  font-size: clamp(var(--font-size-lg), 3vw, var(--font-size-xl));
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
}

.kr-subtitle {
  display: flex;
  gap: var(--spacing-sm);
  align-items: center;
  flex-wrap: wrap;
}



.table-container {
  overflow-x: auto;
  width: 100%;
  -webkit-overflow-scrolling: touch;
  border-radius: var(--border-radius-lg);
  position: relative;
}

.objectives-card {
  margin-bottom: var(--spacing-xl);
  animation: slide-up 0.6s ease-out;
}

.key-results-card {
  margin-top: var(--spacing-xl);
  animation: slide-up 0.7s ease-out;
}

.objectives-table,
.key-results-table {
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-3xl) var(--spacing-xl);
  text-align: center;
  animation: fade-in 0.8s ease-out;
}

.empty-icon {
  font-size: var(--font-size-3xl);
  margin-bottom: var(--spacing-lg);
  opacity: 0.6;
}

.empty-text {
  font-size: var(--font-size-lg);
  color: var(--text-secondary);
  margin-bottom: var(--spacing-lg);
}

.progress-info {
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  background-color: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  animation: fade-in 0.5s ease-out;
}

/* 富文本编辑器样式 */
.rich-text-editor {
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius-md);
  overflow: hidden;
  margin-bottom: var(--spacing-md);
}

.rich-text-editor :deep(.w-e-toolbar) {
  border-bottom: 1px solid var(--border-color-light);
  background-color: var(--bg-secondary);
}

.rich-text-editor :deep(.w-e-text-container) {
  height: 200px;
  overflow: auto;
  background-color: white;
}

.rich-text-editor :deep(.w-e-text-container.editing) {
  overflow-y: auto;
}

.progress-details {
  margin-bottom: var(--spacing-md);
}

.progress-details p {
  margin: var(--spacing-xs) 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.custom-modal {
  border-radius: var(--border-radius-xl);
  overflow: hidden;
}

.modal-form {
  animation: slide-up 0.4s ease-out;
}

.form-input,
.form-textarea,
.form-select,
.form-input-number,
.form-datepicker {
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus,
.form-input-number:focus,
.form-datepicker:focus {
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

/* 关键结果表单美化 */
.modal-form {
  padding: var(--spacing-lg);
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 247, 250, 0.95));
  border-radius: var(--border-radius-xl);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.18);
}

.modal-form .ant-form-item {
  margin-bottom: var(--spacing-md);
  transition: all 0.3s ease;
}

.modal-form .ant-form-item:hover {
  transform: translateY(-1px);
}

.modal-form .ant-form-item-label > label {
  font-size: var(--font-size-base);
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--spacing-xs);
  display: block;
}

.modal-form .ant-form-item-label > label.ant-form-item-required::before {
  color: var(--error-color);
  font-weight: 600;
}

.modal-form .form-input,
.modal-form .form-textarea,
.modal-form .form-input-number {
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-md);
  font-size: var(--font-size-base);
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.8);
}

.modal-form .form-input:focus,
.modal-form .form-textarea:focus,
.modal-form .form-input-number:focus {
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(24, 144, 255, 0.1);
  transform: translateY(-1px);
}

.modal-form .form-textarea {
  resize: vertical;
  min-height: 120px;
}

.modal-form .ant-input-number-input {
  font-size: var(--font-size-base);
  padding: var(--spacing-md);
}

.modal-form .ant-input-number-handler-wrap {
  background-color: rgba(245, 247, 250, 0.8);
  border-left: 2px solid var(--border-color);
}

.modal-form .ant-input-number-handler {
  transition: all 0.3s ease;
}

.modal-form .ant-input-number-handler:hover {
  background-color: var(--primary-light);
}

/* 模态框头部美化 */
.custom-modal .ant-modal-header {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border-radius: var(--border-radius-xl) var(--border-radius-xl) 0 0;
  padding: var(--spacing-lg);
}

.custom-modal .ant-modal-title {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: white;
}

.custom-modal .ant-modal-close {
  color: rgba(255, 255, 255, 0.8);
  transition: all 0.3s ease;
}

.custom-modal .ant-modal-close:hover {
  color: white;
  transform: rotate(90deg);
}

/* 模态框底部按钮美化 */
.custom-modal .ant-modal-footer {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(245, 247, 250, 0.95));
  border-top: 1px solid var(--border-color-light);
  padding: var(--spacing-lg);
  border-radius: 0 0 var(--border-radius-xl) var(--border-radius-xl);
}

.custom-modal .ant-btn {
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-sm) var(--spacing-lg);
  font-size: var(--font-size-base);
  font-weight: 500;
  transition: all 0.3s ease;
}

.custom-modal .ant-btn-primary {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  border: none;
  color: white;
}

.custom-modal .ant-btn-primary:hover {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
  transform: translateY(-1px);
}

.custom-modal .ant-btn-default {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(245, 247, 250, 0.9));
  border: 2px solid var(--border-color);
  color: var(--text-primary);
}

.custom-modal .ant-btn-default:hover {
  background: linear-gradient(135deg, var(--bg-secondary), var(--bg-primary));
  border-color: var(--primary-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

/* 表单行布局样式 */
.form-row {
  display: flex;
  gap: var(--spacing-md);
  align-items: flex-start;
  width: 100%;
}

.form-row-item {
  flex: 1;
  min-width: 0;
}

.form-row-item.unit-item {
  flex: 0 0 120px;
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
  }
  
  .form-row-item.unit-item {
    flex: 1;
  }
}

:deep(.ant-layout) {
  width: 100%;
}

:deep(.ant-card) {
  width: 100%;
  border-radius: var(--border-radius-lg);
  overflow: hidden;
  transition: all 0.3s ease;
}

:deep(.ant-card:hover) {
  box-shadow: var(--shadow-lg);
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

:deep(.ant-space) {
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

:deep(.ant-space-item) {
  margin-bottom: 0;
}

:deep(.ant-btn) {
  border-radius: var(--border-radius-md);
  transition: all 0.3s ease;
}

:deep(.ant-btn:hover) {
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

/* 操作按钮样式 */
:deep(.action-button) {
  border-radius: var(--border-radius-lg);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-sm);
  font-size: var(--font-size-sm);
  font-weight: 500;
  padding: var(--spacing-sm) var(--spacing-md);
  border: none;
  box-shadow: var(--shadow-sm);
  position: relative;
  overflow: hidden;
}

:deep(.action-button::before) {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
  transition: left 0.6s ease;
}

:deep(.action-button:hover::before) {
  left: 100%;
}

:deep(.action-button:hover) {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  z-index: 1;
}

:deep(.action-button:active) {
  transform: translateY(0);
  box-shadow: var(--shadow-md);
  transition: all 0.1s ease;
}

/* 编辑按钮样式 */
:deep(.edit-button) {
  background: linear-gradient(135deg, var(--primary-color), var(--primary-hover));
  color: white;
  border: none;
}

:deep(.edit-button:hover) {
  background: linear-gradient(135deg, var(--primary-hover), var(--primary-active));
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

/* 删除按钮样式 */
:deep(.delete-button) {
  background: linear-gradient(135deg, var(--error-color), var(--error-hover));
  color: white;
  border: none;
}

:deep(.delete-button:hover) {
  background: linear-gradient(135deg, var(--error-hover), var(--error-active));
  box-shadow: 0 4px 12px rgba(245, 34, 45, 0.3);
}

/* 关键结果按钮样式 */
:deep(.kr-button) {
  background: linear-gradient(135deg, var(--success-color), var(--success-hover));
  color: white;
  border: none;
}

:deep(.kr-button:hover) {
  background: linear-gradient(135deg, var(--success-hover), var(--success-active));
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

/* 进度更新按钮样式 */
:deep(.progress-button) {
  background: linear-gradient(135deg, var(--warning-color), var(--warning-hover));
  color: white;
  border: none;
}

:deep(.progress-button:hover) {
  background: linear-gradient(135deg, var(--warning-hover), var(--warning-active));
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
}

/* 查看进度按钮样式 */
:deep(.history-button) {
  background: linear-gradient(135deg, var(--success-color), var(--success-hover));
  color: white;
  border: none;
}

:deep(.history-button:hover) {
  background: linear-gradient(135deg, var(--success-hover), var(--success-active));
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

/* 进度历史记录样式 */
.progress-history-container {
  max-height: 600px;
  overflow-y: auto;
  padding-right: var(--spacing-sm);
  padding-left: var(--spacing-xs);
}

.progress-timeline {
  margin: var(--spacing-lg) 0;
}

:deep(.ant-timeline-item) {
  margin-bottom: var(--spacing-xl);
  transition: all 0.3s ease;
}

:deep(.ant-timeline-item:hover) {
  transform: translateX(8px);
}

:deep(.ant-timeline-item-tail) {
  background-color: var(--border-color-light);
  width: 2px;
}

:deep(.ant-timeline-item-head) {
  width: 16px;
  height: 16px;
  border-width: 2px;
  box-shadow: 0 0 0 4px rgba(24, 144, 255, 0.1);
  transition: all 0.3s ease;
}

:deep(.ant-timeline-item:hover .ant-timeline-item-head) {
  transform: scale(1.2);
  box-shadow: 0 0 0 6px rgba(24, 144, 255, 0.15);
}

:deep(.ant-timeline-item-head-blue) {
  background-color: var(--primary-color);
  border-color: var(--primary-color);
}

:deep(.ant-timeline-item-head-green) {
  background-color: var(--success-color);
  border-color: var(--success-color);
}

.timeline-content {
  background-color: var(--bg-secondary);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
  border-left: 4px solid var(--primary-color);
  position: relative;
  overflow: hidden;
}

.timeline-content::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, var(--primary-color), var(--success-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

:deep(.ant-timeline-item:hover) .timeline-content {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

:deep(.ant-timeline-item:hover) .timeline-content::before {
  transform: scaleX(1);
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding-bottom: var(--spacing-sm);
  border-bottom: 1px solid var(--border-color-light);
}

.timeline-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  flex-wrap: wrap;
}

.update-time {
  font-weight: 700;
  color: var(--text-primary);
  font-size: var(--font-size-sm);
  background-color: rgba(24, 144, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.update-user {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  font-weight: 500;
  background-color: rgba(82, 196, 26, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.progress-values {
  display: flex;
  gap: var(--spacing-md);
  align-items: center;
  flex-wrap: wrap;
}

.previous-value {
  color: var(--text-secondary);
  font-size: var(--font-size-sm);
  text-decoration: line-through;
  background-color: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 12px;
}

.current-value {
  font-weight: 700;
  color: var(--primary-color);
  font-size: var(--font-size-sm);
  background-color: rgba(24, 144, 255, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

.progress-delta {
  font-weight: 700;
  font-size: var(--font-size-lg);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--border-radius-lg);
  display: inline-block;
  background-color: rgba(255, 255, 255, 0.8);
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.progress-delta:hover {
  transform: scale(1.05);
  box-shadow: var(--shadow-md);
}

.delta-positive {
  color: var(--success-color);
  border: 1px solid var(--success-color);
}

.delta-negative {
  color: var(--error-color);
  border: 1px solid var(--error-color);
}

.progress-description {
  background-color: white;
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  border: 1px solid var(--border-color-light);
  min-height: 80px;
  font-size: var(--font-size-sm);
  line-height: 1.7;
  color: var(--text-primary);
  word-break: break-word;
  white-space: pre-wrap;
  box-shadow: var(--shadow-sm);
  transition: all 0.3s ease;
}

.progress-description:hover {
  box-shadow: var(--shadow-md);
}

.progress-description p {
  margin: var(--spacing-xs) 0;
}

.progress-description ul,
.progress-description ol {
  margin: var(--spacing-sm) 0;
  padding-left: var(--spacing-lg);
}

.progress-description li {
  margin: var(--spacing-xs) 0;
}

.empty-description {
  color: var(--text-secondary);
  font-style: italic;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.02);
  border-style: dashed;
}

.progress-history-container::-webkit-scrollbar {
  width: 8px;
}

.progress-history-container::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: var(--border-radius-full);
}

.progress-history-container::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: var(--border-radius-full);
  transition: all 0.3s ease;
}

.progress-history-container::-webkit-scrollbar-thumb:hover {
  background: var(--primary-color);
  transform: scaleX(1.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .timeline-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
  
  .progress-values {
    width: 100%;
    justify-content: space-between;
  }
  
  .timeline-content {
    padding: var(--spacing-md);
  }
  
  .progress-description {
    padding: var(--spacing-md);
    min-height: 60px;
  }
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
  transition: all 0.3s ease;
}

:deep(.ant-table:hover) {
  box-shadow: var(--shadow-sm);
}

:deep(.ant-table-thead > tr > th) {
  background-color: var(--bg-secondary);
  font-weight: 600;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding: var(--spacing-md);
}

:deep(.ant-table-tbody > tr > td) {
  border-bottom: 1px solid var(--border-color-light);
  padding: var(--spacing-md);
  transition: all 0.2s ease;
}

:deep(.ant-table-tbody > tr:hover > td) {
  background-color: rgba(24, 144, 255, 0.02);
}

:deep(.ant-modal-content) {
  border-radius: var(--border-radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
}

:deep(.ant-modal-header) {
  border-bottom: 1px solid var(--border-color-light);
  padding: var(--spacing-lg);
}

:deep(.ant-modal-title) {
  font-size: var(--font-size-lg);
  font-weight: 600;
  color: var(--text-primary);
}

:deep(.ant-modal-body) {
  padding: var(--spacing-lg);
}

:deep(.ant-form-item) {
  margin-bottom: var(--spacing-md);
}

:deep(.ant-form-item-label) {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--text-secondary);
}

:deep(.ant-tag) {
  border-radius: var(--border-radius-md);
  padding: 2px var(--spacing-sm);
}

:deep(.ant-progress) {
  margin: var(--spacing-xs) 0;
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
  
  .header-actions,
  .kr-header {
    flex-direction: column;
    align-items: stretch;
  }
  
  .primary-button {
    width: 100%;
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
  
  .header-title h1 {
    font-size: var(--font-size-xl);
    text-align: center;
  }
  
  .header-subtitle {
    text-align: center;
  }
  
  .kr-title h3 {
    font-size: var(--font-size-lg);
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
  
  /* 操作按钮空间保持水平排列 */
  :deep(.ant-table .ant-space) {
    width: auto;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
  }
  
  :deep(.ant-table .ant-space-item) {
    width: auto;
    flex: 0 0 auto;
  }
  
  :deep(.ant-table .ant-space-item .ant-btn) {
    width: auto;
    flex: 0 0 auto;
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
  
  .header-title h1 {
    font-size: var(--font-size-lg);
  }
  
  .kr-title h3 {
    font-size: var(--font-size-base);
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
  
  :deep(.ant-form-item-label) {
    font-size: var(--font-size-sm);
  }
  
  :deep(.ant-input),
  :deep(.ant-input-number),
  :deep(.ant-select),
  :deep(.ant-picker) {
    font-size: var(--font-size-sm);
  }
  
  :deep(.ant-menu-item) {
    margin: 0;
    padding: 0 var(--spacing-sm);
  }
}
</style>
