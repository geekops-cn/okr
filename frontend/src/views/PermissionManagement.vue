<template>
  <div class="permission-management">
    <a-layout>
      <a-layout-header class="header">
        <div class="logo">OKR系统</div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :default-selected-keys="['5']"
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
          <h1>权限管理</h1>
          
          <!-- 角色管理卡片 -->
          <a-card title="角色管理" class="role-card">
            <div class="role-header">
              <a-button type="primary" @click="showRoleModal = true">创建角色</a-button>
            </div>
            
            <div class="table-container">
              <a-table 
                :columns="roleColumns" 
                :data-source="roles" 
                row-key="id"
                :pagination="false"
                :scroll="{ x: 'max-content' }"
              >
              </a-table>
            </div>
          </a-card>
          
          <!-- 权限管理卡片 -->
          <a-card title="权限列表" class="permission-card">
            <div class="table-container">
              <a-table 
                :columns="permissionColumns" 
                :data-source="permissions" 
                row-key="id"
                :pagination="false"
                :scroll="{ x: 'max-content' }"
              >
              </a-table>
            </div>
          </a-card>
          
          <!-- 创建/编辑角色模态框 -->
          <a-modal
            v-model:open="showRoleModal"
            :title="isEditing ? '编辑角色' : '创建角色'"
            @ok="handleSaveRole"
            @cancel="resetRoleForm"
            :width="{ 'xs': '90%', 'sm': 600, 'md': 600 }"
          >
            <a-form :model="roleForm" :label-col="{ xs: 24, sm: 6 }" :wrapper-col="{ xs: 24, sm: 18 }">
              <a-form-item label="角色名称" name="name" :rules="[{ required: true, message: '请输入角色名称' }]">
                <a-input v-model:value="roleForm.name" placeholder="请输入角色名称" />
              </a-form-item>
              <a-form-item label="角色描述" name="description">
                <a-textarea v-model:value="roleForm.description" placeholder="请输入角色描述" />
              </a-form-item>
            </a-form>
          </a-modal>
          
          <!-- 角色权限分配模态框 -->
          <a-modal
            v-model:open="showPermissionModal"
            title="分配权限"
            :width="{ 'xs': '90%', 'sm': 600, 'md': 800 }"
            @ok="handleSavePermissionAssignment"
            @cancel="resetPermissionForm"
          >
            <div v-if="selectedRole">
              <h4>为角色 "{{ selectedRole.name }}" 分配权限</h4>
              <a-divider />
              <a-checkbox-group v-model:value="selectedPermissionIds">
                <a-row :gutter="[16, 16]">
                  <a-col :xs="24" :sm="12" :md="8" v-for="permission in permissions" :key="permission.id">
                    <a-checkbox :value="permission.id">{{ permission.name }} ({{ permission.code }})</a-checkbox>
                  </a-col>
                </a-row>
              </a-checkbox-group>
            </div>
          </a-modal>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import axios from 'axios';

const router = useRouter();

// 导航到指定页面
const navigateTo = (routeName) => {
  router.push({ name: routeName });
};

// 退出登录
const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('permissions');
  localStorage.removeItem('userInfo');
  message.success('已退出登录');
  router.push({ name: 'Login' });
};

// 状态管理
const roles = ref([]);
const permissions = ref([]);
const showRoleModal = ref(false);
const showPermissionModal = ref(false);
const isEditing = ref(false);
const selectedRole = ref(null);
const selectedPermissionIds = ref([]);

// 表单数据
const roleForm = ref({
  id: null,
  name: '',
  description: ''
});

// 角色表格列配置
const roleColumns = [
  { title: '角色名称', dataIndex: 'name', key: 'name' },
  { title: '描述', dataIndex: 'description', key: 'description' },
  { 
    title: '权限数量', 
    key: 'permissionCount',
    customRender: ({ record }) => record.Permissions?.length || 0
  },
  { 
    title: '操作', 
    key: 'action',
    width: 200,
    customRender: ({ record }) => {
      return [
        h('a-button', {
          type: 'link',
          onClick: () => handleEditRole(record)
        }, '编辑'),
        h('a-button', {
          type: 'link',
          onClick: () => handleDeleteRole(record)
        }, '删除'),
        h('a-button', {
          type: 'link',
          onClick: () => handleAssignPermission(record)
        }, '分配权限')
      ]
    }
  }
];

// 权限表格列配置
const permissionColumns = [
  { title: '权限名称', dataIndex: 'name', key: 'name' },
  { title: '权限标识', dataIndex: 'code', key: 'code' },
  { title: '所属模块', dataIndex: 'module', key: 'module' },
  { title: '描述', dataIndex: 'description', key: 'description' }
];

// 获取角色列表
const fetchRoles = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3001/api/roles', {
      headers: { Authorization: token }
    });
    roles.value = response.data;
  } catch (error) {
    message.error('获取角色列表失败: ' + error.response?.data?.message || error.message);
  }
};

// 获取权限列表
const fetchPermissions = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3001/api/permissions', {
      headers: { Authorization: token }
    });
    permissions.value = response.data;
  } catch (error) {
    message.error('获取权限列表失败: ' + error.response?.data?.message || error.message);
  }
};

// 初始化数据
onMounted(() => {
  fetchRoles();
  fetchPermissions();
});

// 显示编辑角色模态框
const handleEditRole = (record) => {
  isEditing.value = true;
  roleForm.value = {
    id: record.id,
    name: record.name,
    description: record.description
  };
  showRoleModal.value = true;
};

// 删除角色
const handleDeleteRole = async (record) => {
  try {
    if (!confirm('确定要删除角色 "' + record.name + '" 吗？')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3001/api/roles/${record.id}`, {
      headers: { Authorization: token }
    });
    
    message.success('角色删除成功');
    fetchRoles();
  } catch (error) {
    message.error('删除角色失败: ' + error.response?.data?.message || error.message);
  }
};

// 分配权限
const handleAssignPermission = async (record) => {
  selectedRole.value = record;
  // 获取角色当前的权限ID
  selectedPermissionIds.value = record.Permissions?.map(p => p.id) || [];
  showPermissionModal.value = true;
};

// 保存角色
const handleSaveRole = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: token } };
    
    if (isEditing.value) {
      // 编辑角色
      await axios.put(`http://localhost:3001/api/roles/${roleForm.value.id}`, roleForm.value, config);
      message.success('角色更新成功');
    } else {
      // 创建角色
      await axios.post('http://localhost:3001/api/roles', roleForm.value, config);
      message.success('角色创建成功');
    }
    
    showRoleModal.value = false;
    resetRoleForm();
    fetchRoles();
  } catch (error) {
    message.error('保存角色失败: ' + error.response?.data?.message || error.message);
  }
};

// 保存权限分配
const handleSavePermissionAssignment = async () => {
  try {
    if (!selectedRole.value) return;
    
    const token = localStorage.getItem('token');
    await axios.post(`http://localhost:3001/api/roles/${selectedRole.value.id}/permissions`, 
      { permissionIds: selectedPermissionIds.value },
      { headers: { Authorization: token } }
    );
    
    message.success('权限分配成功');
    showPermissionModal.value = false;
    resetPermissionForm();
    fetchRoles();
  } catch (error) {
    message.error('分配权限失败: ' + error.response?.data?.message || error.message);
  }
};

// 重置角色表单
const resetRoleForm = () => {
  roleForm.value = {
    id: null,
    name: '',
    description: ''
  };
  isEditing.value = false;
};

// 重置权限表单
const resetPermissionForm = () => {
  selectedRole.value = null;
  selectedPermissionIds.value = [];
};
</script>

<style scoped>
.permission-management {
  padding: 0;
  margin: 0;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  background-color: #001529;
  padding: 0 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  padding: 16px;
  background-color: #f0f2f5;
  min-height: calc(100vh - 64px);
  flex: 1;
  width: 100%;
  overflow-x: hidden;
}

.content-wrapper {
  background-color: #fff;
  padding: 16px;
  min-height: 280px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 100%;
  width: 100%;
}

.content-wrapper h1 {
  margin-top: 0;
  margin-bottom: 16px;
  font-size: clamp(18px, 4vw, 24px);
}

.role-card,
.permission-card {
  margin-bottom: 20px;
  width: 100%;
}

.role-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
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
}

:deep(.ant-card-body) {
  padding: 16px;
}

/* 响应式设计 */
@media (max-width: 992px) {
  .header {
    padding: 0 16px;
  }
  
  :deep(.ant-menu-horizontal) {
    line-height: 64px;
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
  
  .role-header {
    justify-content: center;
  }
  
  :deep(.ant-btn) {
    width: 100%;
  }
  
  :deep(.ant-card-body) {
    padding: 12px;
  }
  
  :deep(.ant-card-head-title) {
    font-size: 16px;
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
  
  :deep(.ant-modal-body) {
    padding: 16px;
  }
  
  :deep(.ant-form-item) {
    margin-bottom: 12px;
  }
  
  :deep(.ant-row > .ant-col) {
    margin-bottom: 12px;
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
  
  :deep(.ant-checkbox) {
    font-size: 14px;
  }
  
  :deep(.ant-table) {
    font-size: 12px;
  }
  
  :deep(.ant-table-thead > tr > th),
  :deep(.ant-table-tbody > tr > td) {
    padding: 4px;
  }
  
  :deep(.ant-form-item-label) {
    font-size: 14px;
  }
  
  :deep(.ant-input),
  :deep(.ant-textarea) {
    font-size: 14px;
  }
  
  :deep(.ant-divider) {
    margin: 12px 0;
  }
}
</style>
