<template>
  <div class="responsive-menu">
    <!-- 桌面端菜单 -->
    <a-menu
      v-if="!isMobile"
      theme="dark"
      mode="horizontal"
      :selected-keys="[currentKey]"
      style="line-height: 64px; flex: 1;"
    >
      <a-menu-item v-for="item in menuItems" :key="item.key" @click="navigateTo(item.route)">
        {{ item.label }}
      </a-menu-item>
    </a-menu>
    
    <!-- 移动端菜单按钮 -->
    <div v-else class="mobile-menu-trigger">
      <a-button type="text" @click="showDrawer = true">
        <template #icon>
          <MenuOutlined style="color: white; font-size: 20px;" />
        </template>
      </a-button>
    </div>
    
    <!-- 移动端抽屉菜单 -->
    <a-drawer
      v-model:open="showDrawer"
      placement="right"
      title="菜单"
      :width="250"
    >
      <a-menu
        mode="vertical"
        :selected-keys="[currentKey]"
        @click="handleMenuClick"
      >
        <a-menu-item v-for="item in menuItems" :key="item.key">
          {{ item.label }}
        </a-menu-item>
      </a-menu>
    </a-drawer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { MenuOutlined } from '@ant-design/icons-vue';

const props = defineProps({
  currentKey: {
    type: String,
    required: true
  }
});

const router = useRouter();
const route = useRoute();
const showDrawer = ref(false);
const windowWidth = ref(window.innerWidth);

const isMobile = computed(() => windowWidth.value < 992);

const menuItems = [
  { key: '1', label: '首页', route: 'Home' },
  { key: '2', label: 'OKR管理', route: 'OKRManagement' },
  { key: '3', label: '数据分析', route: 'Analytics' },
  { key: '4', label: '用户管理', route: 'UserManagement' },
  { key: '5', label: '权限管理', route: 'PermissionManagement' },
  { key: '6', label: '退出登录', route: 'Logout' }
];

const navigateTo = (routeName) => {
  if (routeName === 'Logout') {
    handleLogout();
  } else {
    router.push({ name: routeName });
  }
};

const handleMenuClick = ({ key }) => {
  const item = menuItems.find(i => i.key === key);
  if (item) {
    navigateTo(item.route);
    showDrawer.value = false;
  }
};

const handleLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('permissions');
  localStorage.removeItem('userInfo');
  router.push({ name: 'Login' });
};

const handleResize = () => {
  windowWidth.value = window.innerWidth;
};

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.responsive-menu {
  flex: 1;
  display: flex;
  align-items: center;
}

.mobile-menu-trigger {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex: 1;
}

:deep(.ant-menu-horizontal) {
  border-bottom: none;
}

:deep(.ant-drawer-body) {
  padding: 0;
}

:deep(.ant-menu-vertical) {
  border-right: none;
}
</style>
