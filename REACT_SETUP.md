# React前端项目集成说明

## 项目结构

```
gaokao-ai/
├── client/                 # React前端项目
│   ├── src/               # React源码
│   │   ├── components/    # 组件
│   │   ├── pages/         # 页面
│   │   ├── App.tsx        # 主应用组件
│   │   └── main.tsx       # 入口文件
│   ├── package.json       # 前端依赖
│   └── vite.config.ts     # Vite配置
├── src/                   # Node.js后端
├── dist/                  # React构建产物
└── package.json           # 主项目配置
```

## 安装依赖

### 1. 安装主项目依赖
```bash
npm install
```

### 2. 安装前端依赖
```bash
npm run client:install
```

## 开发模式

### 同时启动前后端开发服务器
```bash
npm run dev
```

这将同时启动：
- Node.js服务器 (端口4001)
- React开发服务器 (端口3000，代理API请求到4001)

### 单独启动服务器
```bash
# 只启动Node.js服务器
npm run server:dev

# 只启动React开发服务器
npm run client:dev
```

## 生产模式

### 1. 构建React应用
```bash
npm run build
```

### 2. 启动生产服务器
```bash
npm start
```

生产模式下，Node.js服务器会：
- 在端口4001提供API服务
- 提供React构建产物的静态文件服务
- 支持React Router的客户端路由

## 功能特性

### 前端功能
- **首页**: 功能介绍和导航
- **AI聊天**: 与AI助手进行对话
- **高考查询**: 查询高校和专业信息
- **响应式设计**: 支持移动端和桌面端

### 技术栈
- **前端**: React 18 + TypeScript + Ant Design + React Router
- **构建工具**: Vite
- **后端**: Node.js + Express + TypeScript
- **开发工具**: ESLint + Nodemon + Concurrently

### API集成
前端通过axios调用后端API：
- `/api/v1/chat` - AI聊天接口
- `/api/v1/gaokao/*` - 高考查询接口

## 部署说明

1. 构建前端应用：`npm run build`
2. 启动生产服务器：`npm start`
3. 访问应用：`http://localhost:4001`

所有请求都通过同一端口(4001)处理：
- API请求：`/api/*` 路由到后端处理
- 其他请求：返回React应用的index.html
