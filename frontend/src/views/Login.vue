<template>
  <div class="login-container">
    <!-- 科技背景效果 -->
    <div class="tech-background">
      <div class="grid"></div>
      <div class="particles"></div>
    </div>
    
    <div class="login-form-wrapper">
      <div class="login-form">
        <!-- 系统Logo和标题 -->
        <div class="login-header">
          <div class="logo">
            <a-icon type="appstore" theme="filled" />
          </div>
          <h2>OKR系统</h2>
          <p class="subtitle">科技驱动的目标管理平台</p>
        </div>
        
        <a-form
          :model="formState"
          name="login"
          :rules="rules"
          @finish="handleLogin"
          class="form-content"
          layout="vertical"
        >
          <a-form-item
            name="username"
            label="用户名"
            class="form-item"
          >
            <a-input
              v-model:value="formState.username"
              placeholder="请输入用户名"
              class="form-input"
              size="large"
            >
              <template #prefix>
                <a-icon type="user" class="input-icon" />
              </template>
            </a-input>
          </a-form-item>

          <a-form-item
            name="password"
            label="密码"
            class="form-item"
          >
            <a-input-password
              v-model:value="formState.password"
              placeholder="请输入密码"
              class="form-input"
              size="large"
            >
              <template #prefix>
                <a-icon type="lock" class="input-icon" />
              </template>
            </a-input-password>
          </a-form-item>

          <div class="form-options">
            <a-checkbox v-model:checked="remember">记住密码</a-checkbox>
            <a href="#" class="forgot-password">忘记密码？</a>
          </div>

          <a-form-item class="submit-item">
            <a-button
              type="primary"
              html-type="submit"
              :loading="loading"
              block
              size="large"
              class="login-button"
            >
              <template #icon>
                <a-icon type="login" />
              </template>
              登录系统
            </a-button>
          </a-form-item>
        </a-form>
        
        <div class="login-footer">
          <p>© 2026 OKR System. 科技赋能管理</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { message } from 'ant-design-vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../store';


const router = useRouter();
const userStore = useUserStore();

const loading = ref(false);
const remember = ref(false);
const formState = reactive({
  username: '',
  password: ''
});

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度为3-20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为6-20个字符', trigger: 'blur' }
  ]
};

const handleLogin = async () => {
  loading.value = true;
  try {
    // 调用登录API
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: formState.username,
        password: formState.password
      })
    });

    const data = await response.json();
    
    if (response.ok) {
      // 保存token
      userStore.setToken(data.token);
      
      // 调用getCurrentUser获取完整用户信息，包括角色名称
      const userInfoResponse = await fetch('http://localhost:3001/api/auth/me', {
        headers: {
          'Authorization': data.token
        }
      });
      
      if (userInfoResponse.ok) {
        const userInfoData = await userInfoResponse.json();
        // 保存完整用户信息，包括角色名称
        userStore.setUserInfo({
          ...userInfoData.user,
          role: userInfoData.user.Role?.name || ''
        });
        
        message.success('登录成功');
        router.push({ name: 'Home' });
      } else {
        message.error('获取用户信息失败');
      }
    } else {
      message.error(data.message || '登录失败');
    }
  } catch (error) {
    console.error('登录错误:', error);
    message.error('网络错误，请稍后重试');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 基础样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 主容器 */
.login-container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
}

/* 科技背景效果 */
.tech-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

/* 网格背景 */
.grid {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: 
    linear-gradient(rgba(94, 212, 249, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(94, 212, 249, 0.1) 1px, transparent 1px);
  background-size: 50px 50px;
  animation: gridMove 20s linear infinite;
}

/* 粒子效果 */
.particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.particles::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle, rgba(94, 212, 249, 0.15) 1px, transparent 1px);
  background-size: 30px 30px;
  animation: particlesFloat 15s ease-in-out infinite;
}

/* 登录表单包装器 */
.login-form-wrapper {
  position: relative;
  z-index: 1;
  perspective: 1000px;
}

/* 登录表单 */
.login-form {
  width: 100%;
  max-width: 420px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 
    0 8px 32px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  transform-style: preserve-3d;
}

.login-form:hover {
  box-shadow: 
    0 12px 40px rgba(0, 0, 0, 0.4),
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 0 20px rgba(94, 212, 249, 0.2);
  transform: translateY(-5px) rotateX(2deg);
}

/* 登录头部 */
.login-header {
  text-align: center;
  margin-bottom: 40px;
  transform: translateZ(20px);
}

/* Logo */
.logo {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #10b981);
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  animation: logoPulse 2s ease-in-out infinite alternate;
}

.logo :deep(.anticon) {
  font-size: 40px;
  color: white;
}

/* 标题 */
.login-header h2 {
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

/* 副标题 */
.subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
}

/* 表单内容 */
.form-content {
  transform: translateZ(10px);
}

/* 表单项 */
.form-item {
  margin-bottom: 24px !important;
}

/* 表单标签 */
:deep(.ant-form-item-label > label) {
  color: rgba(255, 255, 255, 0.8) !important;
  font-weight: 500 !important;
  font-size: 14px !important;
}

/* 表单输入框 */
.form-input {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  color: #ffffff !important;
  transition: all 0.3s ease !important;
  height: 48px !important;
  width: 100% !important;
  display: block !important;
}

/* 输入框前缀容器 */
:deep(.ant-input-affix-wrapper) {
  width: 100% !important;
  height: 48px !important;
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-radius: 8px !important;
  padding: 0 11px !important;
  display: flex !important;
  align-items: center !important;
}

/* 输入框前缀图标 */
.input-icon {
  color: rgba(255, 255, 255, 0.5) !important;
  width: 16px !important;
  height: 16px !important;
  margin-right: 8px !important;
  flex-shrink: 0 !important;
}

/* 确保输入框内容区域对齐 */
:deep(.ant-input) {
  width: 100% !important;
  background: transparent !important;
  border: none !important;
  color: #ffffff !important;
  height: 100% !important;
  padding: 0 !important;
}

.form-input:hover {
  border-color: rgba(94, 212, 249, 0.5) !important;
  box-shadow: 0 0 0 2px rgba(94, 212, 249, 0.1) !important;
}

.form-input:focus {
  border-color: #3b82f6 !important;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25) !important;
}

/* 输入框占位符 */
:deep(.ant-input::placeholder) {
  color: rgba(255, 255, 255, 0.4) !important;
}

/* 表单选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

/* 复选框 */
:deep(.ant-checkbox-inner) {
  background-color: rgba(255, 255, 255, 0.08) !important;
  border-color: rgba(255, 255, 255, 0.15) !important;
}

:deep(.ant-checkbox-input:checked + .ant-checkbox-inner) {
  background-color: #3b82f6 !important;
  border-color: #3b82f6 !important;
}

:deep(.ant-checkbox-label) {
  color: rgba(255, 255, 255, 0.7) !important;
  font-size: 14px !important;
}

/* 忘记密码链接 */
.forgot-password {
  color: rgba(94, 212, 249, 0.8) !important;
  font-size: 14px !important;
  text-decoration: none !important;
  transition: color 0.3s ease !important;
}

.forgot-password:hover {
  color: #5ed4f9 !important;
  text-shadow: 0 0 8px rgba(94, 212, 249, 0.5) !important;
}

/* 提交按钮 */
.submit-item {
  margin-bottom: 0 !important;
}

.login-button {
  height: 48px !important;
  border-radius: 8px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  background: linear-gradient(135deg, #3b82f6, #10b981) !important;
  border: none !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4) !important;
  transition: all 0.3s ease !important;
  position: relative;
  overflow: hidden;
}

.login-button:hover {
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.6), 0 0 12px rgba(16, 185, 129, 0.4) !important;
  transform: translateY(-2px) !important;
}

.login-button:active {
  transform: translateY(0) !important;
}

.login-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s ease;
}

.login-button:hover::before {
  left: 100%;
}

/* 登录页脚 */
.login-footer {
  margin-top: 32px;
  text-align: center;
}

.login-footer p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
}

/* 动画效果 */
@keyframes gridMove {
  0% {
    background-position: 0 0;
  }
  100% {
    background-position: 50px 50px;
  }
}

@keyframes particlesFloat {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

@keyframes logoPulse {
  0% {
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  }
  100% {
    box-shadow: 0 6px 24px rgba(16, 185, 129, 0.6);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .login-container {
    padding: 16px;
  }
  
  .login-form {
    max-width: 100%;
    padding: 32px;
  }
  
  .login-header h2 {
    font-size: 24px;
  }
  
  .form-item {
    margin-bottom: 20px !important;
  }
  
  .form-input {
    height: 44px !important;
  }
  
  .login-button {
    height: 44px !important;
  }
}

@media (max-width: 576px) {
  .login-form {
    padding: 24px;
    border-radius: 12px;
  }
  
  .logo {
    width: 64px;
    height: 64px;
  }
  
  .logo :deep(.anticon) {
    font-size: 32px;
  }
  
  .login-header h2 {
    font-size: 20px;
  }
  
  .subtitle {
    font-size: 12px;
  }
  
  .form-item {
    margin-bottom: 16px !important;
  }
  
  .form-input {
    height: 40px !important;
  }
  
  .login-button {
    height: 40px !important;
    font-size: 14px !important;
  }
}

@media (max-width: 360px) {
  .login-form {
    padding: 20px;
  }
  
  .login-header {
    margin-bottom: 24px;
  }
  
  .form-options {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .forgot-password {
    align-self: flex-end;
  }
}
</style>
