# 使用 Node 18（内置 Corepack）
FROM node:18-alpine

# 设置工作目录
WORKDIR /app

# 启用 Corepack 并指定 pnpm 版本（与本地一致）
RUN corepack enable && corepack prepare pnpm@9.0.0 --activate

# 复制依赖文件（利用缓存）
COPY package.json pnpm-lock.yaml ./
COPY client/package.json client/pnpm-lock.yaml ./client/

# 安装依赖（使用 frozen-lockfile 确保一致性）
RUN pnpm install

# 复制项目剩余文件
COPY . .

# 暴露端口
EXPOSE 3000

# 启动服务
CMD ["pnpm", "start"]