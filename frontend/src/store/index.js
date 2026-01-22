import { createPinia } from 'pinia';
import { defineStore } from 'pinia';

// 创建Pinia实例
const pinia = createPinia();

// 用户状态管理
export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: JSON.parse(localStorage.getItem('userInfo')) || {}
  }),
  actions: {
    setToken(token) {
      this.token = token;
      localStorage.setItem('token', token);
    },
    setUserInfo(userInfo) {
      this.userInfo = userInfo;
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
      // 保存角色信息到localStorage，用于路由守卫检查
      localStorage.setItem('role', userInfo.role || '');
    },
    logout() {
      this.token = '';
      this.userInfo = {};
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      localStorage.removeItem('role');
    }
  }
});

// OKR状态管理
export const useOKRStore = defineStore('okr', {
  state: () => ({
    objectives: [],
    keyResults: []
  }),
  actions: {
    setObjectives(objectives) {
      this.objectives = objectives;
    },
    addObjective(objective) {
      this.objectives.push(objective);
    },
    updateObjective(updatedObjective) {
      const index = this.objectives.findIndex(obj => obj.id === updatedObjective.id);
      if (index !== -1) {
        this.objectives[index] = updatedObjective;
      }
    },
    deleteObjective(objectiveId) {
      this.objectives = this.objectives.filter(obj => obj.id !== objectiveId);
    },
    setKeyResults(keyResults) {
      this.keyResults = keyResults;
    }
  }
});

export default pinia;
