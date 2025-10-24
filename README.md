# 高考AI智能助手

## 🚀 项目架构

### 开发环境（热更新）
```
前端开发服务器 (3000端口)          后端服务器 (4001端口)
    ↓ /api/* 请求代理到 →              ↓
Vite Dev Server                   Express服务器
    ├── 热更新                        ├── /api/v1/* → API处理
    ├── HMR                          ├── /jade → Jade模板
    └── 代理 /api/* → 4001           └── Nodemon 热重载
```

### 生产环境（统一端口）
```
用户请求 (4001端口)
    ↓
Express服务器
    ├── /api/v1/* → API处理 (Node.js后端)
    ├── /jade → Jade模板页面
    ├── 静态资源 → React构建产物
    └── /* → React应用 (SPA路由)
```

## 📦 快速开始

### 安装依赖
```bash
npm install
```

### 开发环境（支持热更新）
```bash
npm run dev
```
会同时启动：
- 前端开发服务器: http://localhost:3000 （支持热更新）
- 后端服务器: http://localhost:4001 （Nodemon自动重启）

**开发时访问**: http://localhost:3000

### 生产环境
```bash
npm start
```
构建前端 + 启动Express服务器（4001端口）

**生产访问**: http://localhost:4001

### 仅构建前端
```bash
npm run build
```

## 🎯 访问地址

### 开发环境
- **前端页面**: http://localhost:3000 （所有React页面，支持热更新）
- **后端API**: http://localhost:4001/api/v1/* （API接口）

### 生产环境
- **所有功能**: http://localhost:4001 （前后端统一）
  - 首页: http://localhost:4001/
  - AI聊天: http://localhost:4001/chat
  - 高考查询: http://localhost:4001/gaokao
  - 原始页面: http://localhost:4001/jade
  - API接口: http://localhost:4001/api/v1/*

## 🔧 项目特点

### 开发体验
- ✅ **前端热更新**：Vite HMR，代码修改立即生效
- ✅ **后端热重载**：Nodemon自动重启
- ✅ **API代理**：开发环境自动代理API请求
- ✅ **并发运行**：前后端同时启动

### 生产部署
- ✅ **统一端口**：前后端都运行在4001端口
- ✅ **路由分离**：`/api/v1/*` → Node.js，其他 → React
- ✅ **SPA支持**：支持React Router的客户端路由
- ✅ **部署简单**：只需要一个端口

### 功能完整
- ✅ AI流式聊天
- ✅ 高考信息查询
- ✅ 响应式设计
- ✅ 现代化UI

## 📋 脚本说明

- `npm start` - 构建并启动生产服务器（4001端口）
- `npm run dev` - 启动开发环境（前端3000 + 后端4001，支持热更新）
- `npm run server:dev` - 仅启动后端开发服务器（4001端口）
- `npm run client:dev` - 仅启动前端开发服务器（3000端口）
- `npm run build` - 构建React前端应用
- `npm install` - 安装所有依赖（前后端）

## 🌐 部署

项目支持多种部署方式：
- Zeabur
- Docker
- 传统服务器
- 云服务器

只需要确保4001端口可访问即可。