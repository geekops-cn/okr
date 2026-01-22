import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    // 资源压缩
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 代码分割
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vendor';
            }
            if (id.includes('ant-design-vue')) {
              return 'antd';
            }
            if (id.includes('echarts')) {
              return 'echarts';
            }
            if (id.includes('axios')) {
              return 'axios';
            }
          }
        }
      }
    },
    // 缓存策略
    assetsDir: 'assets',
    assetFileNames: {
      js: 'js/[name]-[hash].js',
      css: 'css/[name]-[hash].css',
      images: 'images/[name]-[hash].[ext]'
    }
  },
  // 开发服务器优化
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
})
