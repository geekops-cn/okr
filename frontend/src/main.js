import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import pinia from './store'
import Antd from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'
import * as Icons from '@ant-design/icons-vue'

const app = createApp(App)

// 注册所有Ant Design图标
for (const [key, component] of Object.entries(Icons)) {
  app.component(key, component)
}

// 使用插件
app.use(Antd)
app.use(router)
app.use(pinia)

app.mount('#app')
