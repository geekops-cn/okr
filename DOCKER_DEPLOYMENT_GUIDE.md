# OKR 系统 Docker 部署指南

## 项目简介

OKR (Objectives and Key Results) 系统是一个目标管理平台，用于帮助组织和个人设定、跟踪和实现目标。本系统采用前后端分离架构，使用 Vue 3 + Ant Design Vue 作为前端技术栈，Express.js + Sequelize + MySQL 作为后端技术栈。

## 系统要求

- Docker 19.03+ 
- Docker Compose 1.25+ 
- 至少 2GB 内存
- 至少 20GB 磁盘空间
- 网络连接（用于拉取镜像）

## 部署前准备

1. **克隆代码仓库**
   ```bash
   git clone <仓库地址>
   cd OKR
   ```

2. **检查环境变量配置**
   - 后端环境变量：`backend/.env` 文件已配置基本参数
   - Docker Compose 配置：`docker-compose.yml` 文件已配置服务参数

3. **确认端口可用性**
   - MySQL: 3307 (主机) → 3306 (容器)
   - 后端服务: 3001
   - 前端服务: 5173

## Docker 环境搭建

### 安装 Docker

#### Ubuntu/Debian
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker
```

#### CentOS/RHEL
```bash
sudo yum install -y yum-utils
sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo yum install docker-ce docker-ce-cli containerd.io
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER
newgrp docker
```

#### macOS
- 下载并安装 Docker Desktop for Mac: https://www.docker.com/products/docker-desktop

#### Windows
- 下载并安装 Docker Desktop for Windows: https://www.docker.com/products/docker-desktop

### 安装 Docker Compose

```bash
# 下载最新版本
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose

# 赋予执行权限
sudo chmod +x /usr/local/bin/docker-compose

# 验证安装
docker-compose --version
```

## 部署步骤

### 1. 构建 Docker 镜像

```bash
# 在项目根目录执行
docker-compose build
```

### 2. 启动服务

```bash
# 启动所有服务（后台运行）
docker-compose up -d

# 查看服务启动状态
docker-compose ps
```

### 3. 初始化数据库

服务启动后，后端应用会自动连接数据库并创建表结构。首次启动时，系统会自动执行初始化数据脚本，创建默认管理员账号：

- **用户名**: admin
- **密码**: admin123

## 配置说明

### Docker Compose 配置 (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  # MySQL数据库服务
  db:
    image: mysql:8.0
    container_name: okr_db
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: 123.com  # 数据库根密码
      MYSQL_DATABASE: okr_db        # 数据库名称
    ports:
      - "3307:3306"  # 主机端口:容器端口
    volumes:
      - mysql_data:/var/lib/mysql  # 数据持久化
    networks:
      - okr_network

  # 后端服务
  backend:
    build: ./backend
    container_name: okr_backend
    restart: unless-stopped
    environment:
      - PORT=3001
      - DB_HOST=db
      - DB_USER=root
      - DB_PASSWORD=123.com
      - DB_NAME=okr_db
      - DB_PORT=3306
      - JWT_SECRET=your_jwt_secret_key
      - NODE_ENV=production
    ports:
      - "3001:3001"
    depends_on:
      - db
    networks:
      - okr_network

  # 前端服务
  frontend:
    build: ./frontend
    container_name: okr_frontend
    restart: unless-stopped
    ports:
      - "5173:80"
    depends_on:
      - backend
    networks:
      - okr_network

# 网络配置
networks:
  okr_network:
    driver: bridge

# 数据卷配置
volumes:
  mysql_data:
    driver: local
```

### 环境变量说明

#### 后端环境变量
- `PORT`: 后端服务端口
- `DB_HOST`: 数据库主机名
- `DB_USER`: 数据库用户名
- `DB_PASSWORD`: 数据库密码
- `DB_NAME`: 数据库名称
- `DB_PORT`: 数据库端口
- `JWT_SECRET`: JWT 密钥
- `NODE_ENV`: 运行环境 (development/production)

## 启动和停止服务

### 启动服务
```bash
docker-compose up -d
```

### 停止服务
```bash
docker-compose down
```

### 重启服务
```bash
docker-compose restart
```

### 查看服务日志
```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs backend
```

## 访问方式

### 前端访问
- 地址: http://localhost:5173
- 默认账号: admin
- 默认密码: admin123

### 后端 API 访问
- 地址: http://localhost:3001
- API 文档: http://localhost:3001/api-docs (如果已配置)

### 数据库访问
- 主机: localhost
- 端口: 3307
- 用户名: root
- 密码: 123.com
- 数据库: okr_db

## 常见问题排查

### 1. 服务启动失败

**症状**: `docker-compose ps` 显示服务状态为 `Exit` 或 `Restarting`

**解决方法**:
```bash
# 查看服务日志
docker-compose logs <服务名>

# 常见问题:
# - 数据库连接失败: 检查数据库服务是否正常启动
# - 端口被占用: 检查是否有其他服务占用了相同端口
# - 环境变量错误: 检查环境变量配置是否正确
```

### 2. 前端无法访问后端 API

**症状**: 前端页面显示 API 请求失败，控制台有网络错误

**解决方法**:
```bash
# 检查后端服务状态
docker-compose ps backend

# 检查后端服务日志
docker-compose logs backend

# 测试后端 API 是否可访问
curl http://localhost:3001/api/health
```

### 3. 数据库连接失败

**症状**: 后端服务日志显示数据库连接错误

**解决方法**:
```bash
# 检查数据库服务状态
docker-compose ps db

# 检查数据库服务日志
docker-compose logs db

# 确认数据库环境变量配置正确
```

### 4. 前端页面空白

**症状**: 访问前端地址显示空白页面，控制台有 JavaScript 错误

**解决方法**:
```bash
# 检查前端服务状态
docker-compose ps frontend

# 检查前端服务日志
docker-compose logs frontend

# 确认后端服务是否正常运行
```

## 版本信息

### 当前版本
- 版本号: v0.1
- 发布日期: 2026-01-22

### 镜像信息

| 镜像名称 | 标签 | 大小 | 压缩后大小 |
|---------|------|------|-----------|
| okr-backend | v0.1 | 264MB | 57.3MB |
| okr-frontend | v0.1 | 97.5MB | 27.1MB |

### 技术栈

- **前端**:
  - Vue 3 + Composition API
  - Ant Design Vue
  - Vite
  - ECharts

- **后端**:
  - Express.js
  - Sequelize ORM
  - MySQL
  - JWT 认证

- **容器化**:
  - Docker
  - Docker Compose
  - Nginx

## 维护与更新

### 更新服务

1. **获取最新代码**
   ```bash
   git pull
   ```

2. **重新构建镜像**
   ```bash
   docker-compose build
   ```

3. **重启服务**
   ```bash
   docker-compose up -d
   ```

### 备份数据

```bash
# 备份数据库
docker exec -it okr_db mysqldump -u root -p123.com okr_db > okr_db_backup.sql

# 备份数据卷 (可选)
docker volume inspect okr_mysql_data
```

### 恢复数据

```bash
# 恢复数据库
cat okr_db_backup.sql | docker exec -i okr_db mysql -u root -p123.com okr_db
```

## 安全建议

1. **生产环境配置**:
   - 修改默认的数据库密码
   - 更改 JWT 密钥
   - 配置 HTTPS
   - 限制容器网络访问

2. **定期维护**:
   - 定期备份数据库
   - 更新 Docker 镜像和依赖
   - 监控系统运行状态

3. **权限管理**:
   - 使用最小权限原则配置容器
   - 定期审查用户权限

## 联系与支持

- **技术支持**: <支持邮箱>
- **文档更新**: <文档地址>
- **版本管理**: <版本控制地址>

---

**© 2026 OKR 系统开发团队**