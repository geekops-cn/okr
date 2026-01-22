<template>
  <div class="user-management">
    <a-layout>
      <a-layout-header class="header">
        <div class="logo">OKR系统</div>
        <a-menu
          theme="dark"
          mode="horizontal"
          :default-selected-keys="['4']"
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
          <h1>用户管理</h1>
          
          <!-- 用户管理卡片 -->
          <a-card title="用户列表" class="user-card">
            <div class="user-header">
              <a-button type="primary" @click="showUserModal = true">创建用户</a-button>
            </div>
            
            <div class="table-container">
              <a-table 
                :columns="userColumns" 
                :data-source="users" 
                row-key="id"
                :pagination="{ pageSize: 10 }"
                :scroll="{ x: 'max-content' }"
              >
              </a-table>
            </div>
          </a-card>
          
          <!-- 创建/编辑用户模态框 -->
          <a-modal
            v-model:open="showUserModal"
            :title="isEditing ? '编辑用户' : '创建用户'"
            @ok="handleSaveUser"
            @cancel="resetUserForm"
            :width="{ 'xs': '90%', 'sm': 600, 'md': 600 }"
          >
            <a-form :model="userForm" :label-col="{ xs: 24, sm: 6 }" :wrapper-col="{ xs: 24, sm: 18 }">
              <a-form-item label="用户名" name="username" :rules="[{ required: true, message: '请输入用户名' }]">
                <a-input v-model:value="userForm.username" placeholder="请输入用户名" />
              </a-form-item>
              
              <a-form-item 
                v-if="!isEditing" 
                label="密码" 
                name="password" 
                :rules="[{ required: true, message: '请输入密码' }]"
              >
                <a-input-password v-model:value="userForm.password" placeholder="请输入密码" />
              </a-form-item>
              
              <a-form-item label="姓名" name="name" :rules="[{ required: true, message: '请输入姓名' }]">
                <a-input v-model:value="userForm.name" placeholder="请输入姓名" />
              </a-form-item>
              
              <a-form-item label="邮箱" name="email" :rules="[
                { required: true, message: '请输入邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' }
              ]">
                <a-input v-model:value="userForm.email" placeholder="请输入邮箱" />
              </a-form-item>
              
              <a-form-item label="角色" name="roleId" :rules="[{ required: true, message: '请选择角色' }]">
                <a-select v-model:value="userForm.roleId" placeholder="请选择角色">
                  <a-select-option 
                    v-for="role in roles" 
                    :key="role.id" 
                    :value="role.id"
                  >
                    {{ role.name }}
                  </a-select-option>
                </a-select>
              </a-form-item>
              

            </a-form>
          </a-modal>
        </div>
      </a-layout-content>
    </a-layout>
  </div>
</template>

<script setup>
import { ref, onMounted, h } from 'vue';
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
const users = ref([]);
const roles = ref([]);
const showUserModal = ref(false);
const isEditing = ref(false);

// 表单数据
const userForm = ref({
  id: null,
  username: '',
  password: '',
  name: '',
  email: '',
  roleId: null
});

// 用户表格列配置
const userColumns = [
  { title: '用户名', dataIndex: 'username', key: 'username' },
  { title: '姓名', dataIndex: 'name', key: 'name' },
  { title: '邮箱', dataIndex: 'email', key: 'email' },
  { 
    title: '角色', 
    dataIndex: 'Role', 
    key: 'role',
    customRender: ({ record }) => record.Role?.name || ''
  },
  { 
    title: '操作', 
    key: 'action',
    width: 150,
    customRender: ({ record }) => {
      return [
        h('a-button', {
          type: 'link',
          onClick: () => handleEditUser(record)
        }, '编辑'),
        h('a-button', {
          type: 'link',
          danger: true,
          onClick: () => handleDeleteUser(record)
        }, '删除')
      ]
    }
  }
];

// 获取用户列表
const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await axios.get('http://localhost:3001/api/users', {
      headers: { Authorization: token }
    });
    users.value = response.data;
  } catch (error) {
    message.error('获取用户列表失败: ' + error.response?.data?.message || error.message);
  }
};

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

// 初始化数据
onMounted(() => {
  fetchUsers();
  fetchRoles();
});

// 显示编辑用户模态框
const handleEditUser = (record) => {
  isEditing.value = true;
  userForm.value = {
    id: record.id,
    username: record.username,
    password: '',
    name: record.name,
    email: record.email,
    roleId: record.roleId
  };
  showUserModal.value = true;
};

// 删除用户
const handleDeleteUser = async (record) => {
  try {
    if (!confirm('确定要删除用户 "' + record.username + '" 吗？')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:3001/api/users/${record.id}`, {
      headers: { Authorization: token }
    });
    
    message.success('用户删除成功');
    fetchUsers();
  } catch (error) {
    message.error('删除用户失败: ' + error.response?.data?.message || error.message);
  }
};

// 保存用户
const handleSaveUser = async () => {
  try {
    const token = localStorage.getItem('token');
    const config = { headers: { Authorization: token } };
    
    if (isEditing.value) {
      // 编辑用户
      const { password, ...updateData } = userForm.value;
      await axios.put(`http://localhost:3001/api/users/${userForm.value.id}`, updateData, config);
      message.success('用户更新成功');
    } else {
      // 创建用户
      await axios.post('http://localhost:3001/api/users', userForm.value, config);
      message.success('用户创建成功');
    }
    
    showUserModal.value = false;
    resetUserForm();
    fetchUsers();
  } catch (error) {
    message.error('保存用户失败: ' + error.response?.data?.message || error.message);
  }
};

// 重置用户表单
const resetUserForm = () => {
  userForm.value = {
    id: null,
    username: '',
    password: '',
    name: '',
    email: '',
    roleId: null
  };
  isEditing.value = false;
};
</script>

<style scoped>
.user-management {
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
  font-size: clamp(18px, 4vw, 24px);
}

.user-card {
  margin-bottom: 20px;
  width: 100%;
}

.user-header {
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

:deep(.ant-card-head-title) {
  font-size: 18px;
  font-weight: bold;
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
  
  .user-header {
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
  
  .user-header {
    flex-direction: column;
    gap: 12px;
  }
  
  :deep(.ant-card-head-title) {
    font-size: 14px;
  }
  
  :deep(.ant-card-body) {
    padding: 8px;
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
  :deep(.ant-select) {
    font-size: 14px;
  }
}
</style>
