# 生产环境部署指南

## 🚀 部署架构

```
用户请求 → Nginx (80端口) → React应用 (3000端口)
                          ↘ API代理 → Express服务器 (4001端口)
```

## 📦 部署步骤

### 1. 构建应用
```bash
# 安装依赖
npm install

# 构建React应用
npm run build
```

### 2. 启动生产服务
```bash
# 启动生产环境（React预览服务器 + Express API服务器）
npm run start:prod
```

### 3. Nginx配置

项目提供了两个Nginx配置文件：

- **`nginx.conf`**: 生产环境完整配置（包含SSL、缓存、安全头等）
- **`nginx-dev.conf`**: 开发环境简化配置

#### 自动部署Nginx配置

```bash
# 使用自动部署脚本
./nginx-setup.sh
```

#### 手动配置Nginx

**Ubuntu/Debian系统：**
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/gaokao-ai
sudo ln -s /etc/nginx/sites-available/gaokao-ai /etc/nginx/sites-enabled/

# 禁用默认站点
sudo rm /etc/nginx/sites-enabled/default

# 测试并重启
sudo nginx -t
sudo systemctl restart nginx
```

**CentOS/RHEL系统：**
```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/conf.d/gaokao-ai.conf

# 测试并重启
sudo nginx -t
sudo systemctl restart nginx
```

## 🔧 环境说明

### 开发环境
- **命令**: `npm run dev`
- **React开发服务器**: http://localhost:3000 (热重载)
- **Express API服务器**: http://localhost:4001
- **特点**: 热重载、快速构建、开发工具

### 生产环境
- **命令**: `npm run start:prod`
- **React预览服务器**: http://localhost:3000 (构建版本)
- **Express API服务器**: http://localhost:4001
- **特点**: 优化构建、生产性能

## 📋 服务管理

### 使用PM2管理进程（推荐）
```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start npm --name "gaokao-ai" -- run start:prod

# 查看状态
pm2 status

# 查看日志
pm2 logs gaokao-ai

# 重启应用
pm2 restart gaokao-ai

# 停止应用
pm2 stop gaokao-ai
```

### 使用systemd管理服务
```bash
# 创建服务文件
sudo nano /etc/systemd/system/gaokao-ai.service
```

```ini
[Unit]
Description=Gaokao AI Application
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/gaokao-ai
ExecStart=/usr/bin/npm run start:prod
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

```bash
# 启用并启动服务
sudo systemctl enable gaokao-ai
sudo systemctl start gaokao-ai
sudo systemctl status gaokao-ai
```

## 🔍 健康检查

### 检查服务状态
```bash
# 检查React应用
curl http://localhost:3000

# 检查API服务
curl http://localhost:4001/api/v1/chat

# 检查流式API
curl -X POST http://localhost:4001/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{"question":"你好"}'
```

## 🛠 故障排除

### 常见问题

1. **端口被占用**
   ```bash
   # 查看端口占用
   lsof -i :3000
   lsof -i :4001
   
   # 杀死进程
   kill -9 <PID>
   ```

2. **构建失败**
   ```bash
   # 清理缓存
   rm -rf node_modules client/node_modules
   npm install
   ```

3. **API代理失败**
   - 检查4001端口的Express服务是否正常运行
   - 检查Vite配置中的proxy设置

## 📊 监控建议

- 使用PM2监控进程状态
- 配置Nginx日志记录
- 设置应用性能监控（如New Relic、DataDog）
- 配置错误日志收集

## 🔐 安全建议

- 使用HTTPS（配置SSL证书）
- 设置防火墙规则
- 定期更新依赖包
- 配置访问日志和错误日志
