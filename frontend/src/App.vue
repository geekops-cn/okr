<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useUserStore } from './store';

const userStore = useUserStore();

// 应用启动时检查用户信息，确保角色信息正确保存
onMounted(async () => {
  if (userStore.token && !localStorage.getItem('role')) {
    try {
      // 调用getCurrentUser获取完整用户信息，包括角色名称
      const response = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': userStore.token
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        // 保存完整用户信息，包括角色名称
        userStore.setUserInfo({
          ...data.user,
          role: data.user.Role?.name || ''
        });
      }
    } catch (error) {
      console.error('获取用户信息失败:', error);
    }
  }
});
</script>

<style>
* {
  box-sizing: border-box;
}

html, body {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#app {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #f0f2f5;
}
</style>
