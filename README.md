# 高考AI智能助手

## 🚀 项目架构

**统一端口架构 - 4001端口**
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

### 开发环境
```bash
npm run dev
```

### 生产环境
```bash
npm start
```

### 构建前端
```bash
npm run build
```

## 🎯 访问地址

所有功能都通过 **4001端口** 访问：

- **首页**: http://localhost:4001/
- **AI聊天**: http://localhost:4001/chat
- **高考查询**: http://localhost:4001/gaokao
- **原始页面**: http://localhost:4001/jade
- **API接口**: http://localhost:4001/api/v1/*

## 🔧 项目特点

### 统一端口
- ✅ 前后端都运行在4001端口
- ✅ 无需复杂的代理配置
- ✅ 部署简单，只需要一个端口

### 路由分离
- ✅ `/api/v1/*` → Node.js API处理
- ✅ 其他路径 → React应用处理
- ✅ 支持React Router的客户端路由

### 功能完整
- ✅ AI流式聊天
- ✅ 高考信息查询
- ✅ 响应式设计
- ✅ 热重载开发

## 📋 脚本说明

- `npm start` - 构建并启动生产服务器
- `npm run dev` - 构建并启动开发服务器（热重载）
- `npm run build` - 构建React前端应用
- `npm install` - 安装所有依赖（前后端）

## 🌐 部署

项目支持多种部署方式：
- Zeabur
- Docker
- 传统服务器
- 云服务器

只需要确保4001端口可访问即可。