# 多阶段构建 - 构建阶段
# Multi-stage build - Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件
# Copy dependency files
COPY package*.json ./

# 安装依赖
# Install dependencies
RUN npm ci

# 复制源代码
# Copy source code
COPY . .

# 构建参数 - API 基础 URL
# Build arguments - API base URL
ARG VITE_API_BASE_URL=http://localhost:3001/api
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

# 构建项目
# Build project
RUN npm run build

# 生产阶段 - 使用 Nginx 提供静态文件服务
# Production stage - Use Nginx to serve static files
FROM nginx:alpine

# 复制构建产物到 Nginx
# Copy build output to Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制 Nginx 配置
# Copy Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
# Expose port
EXPOSE 80

# Nginx 会自动启动
# Nginx will start automatically

