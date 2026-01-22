# 使用Node.js官方镜像作为构建阶段
FROM node:20-alpine AS build

# 设置工作目录
WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 使用Nginx作为生产服务器
FROM nginx:alpine

# 复制构建产物到Nginx的html目录
COPY --from=build /app/dist /usr/share/nginx/html

# 复制Nginx配置文件，支持Vue Router的history模式
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]
