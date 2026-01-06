# 多阶段构建 - 构建阶段
# Multi-stage build - Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# 复制依赖文件和 Prisma schema
# Copy dependency files and Prisma schema
COPY package*.json ./
COPY prisma ./prisma/
COPY tsconfig.json ./

# 复制 Prisma 配置（如果存在）
# Copy Prisma config if exists
COPY prisma.config.ts* ./

# 安装所有依赖（包括 devDependencies，构建需要）
# Install all dependencies (including devDependencies, required for build)
RUN npm ci

# 生成 Prisma Client
# Generate Prisma Client
RUN npx prisma generate

# 复制源代码
# Copy source code
COPY src ./src

# 构建项目
# Build project
RUN npm run build

# 生产阶段
# Production stage
FROM node:18-alpine

WORKDIR /app

# 安装生产依赖
# Install production dependencies
COPY package*.json ./
RUN npm ci --only=production

# 从构建阶段复制必要文件
# Copy necessary files from build stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma

# 注意：Prisma Client 已在构建阶段生成，这里直接复制即可
# Note: Prisma Client was already generated in build stage, just copy it

# 创建数据目录
# Create data directory
RUN mkdir -p /app/prisma/data

# 暴露端口
# Expose port
EXPOSE 3001

# 启动命令
# Start command
CMD ["npm", "start"]

