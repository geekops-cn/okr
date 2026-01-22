<template>
  <div v-if="hasPermission" :class="$attrs.class">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue';

// 组件属性
const props = defineProps({
  /**
   * 所需权限的code或权限数组
   */
  permission: {
    type: [String, Array],
    required: true
  },
  /**
   * 权限检查逻辑：
   * - all: 需要拥有所有指定权限
   * - any: 至少拥有其中一个权限
   */
  type: {
    type: String,
    default: 'any',
    validator: (value) => ['all', 'any'].includes(value)
  }
});

// 从localStorage获取用户权限
const getUserPermissions = () => {
  const permissionsStr = localStorage.getItem('permissions');
  if (!permissionsStr) {
    return [];
  }
  try {
    return JSON.parse(permissionsStr);
  } catch (error) {
    console.error('解析权限列表失败:', error);
    return [];
  }
};

// 检查用户是否具有所需权限
const hasPermission = computed(() => {
  const userPermissions = getUserPermissions();
  
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }
  
  if (Array.isArray(props.permission)) {
    if (props.type === 'all') {
      // 需要拥有所有权限
      return props.permission.every(perm => userPermissions.includes(perm));
    } else {
      // 至少拥有其中一个权限
      return props.permission.some(perm => userPermissions.includes(perm));
    }
  } else {
    // 单个权限检查
    return userPermissions.includes(props.permission);
  }
});
</script>

<style scoped>
/* 组件样式 */
</style>