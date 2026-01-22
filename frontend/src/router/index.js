import { createRouter, createWebHistory } from 'vue-router';

// 动态导入，实现代码分割和懒加载
const Login = () => import('../views/Login.vue');
const Home = () => import('../views/Home.vue');
const OKRManagement = () => import('../views/OKRManagement.vue');
const Analytics = () => import('../views/Analytics.vue');
const PermissionManagement = () => import('../views/PermissionManagement.vue');
const UserManagement = () => import('../views/UserManagement.vue');

// 路由配置
const routes = [
  {
    path: '/',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true }
  },
  {
    path: '/okr',
    name: 'OKRManagement',
    component: OKRManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/analytics',
    name: 'Analytics',
    component: Analytics,
    meta: { requiresAuth: true }
  },
  {
    path: '/permission',
    name: 'PermissionManagement',
    component: PermissionManagement,
    meta: { requiresAuth: true, adminOnly: true }
  },
  {
    path: '/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, adminOnly: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫，验证用户是否已登录且具有相应权限
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token');
  const userRole = localStorage.getItem('role');
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      next({ name: 'Login' });
    } else {
      // 检查是否需要管理员权限
      if (to.matched.some(record => record.meta.adminOnly)) {
        if (userRole !== 'admin') {
          // 非管理员跳转到首页
          next({ name: 'Home' });
        } else {
          next();
        }
      } else {
        next();
      }
    }
  } else {
    next();
  }
});

export default router;
