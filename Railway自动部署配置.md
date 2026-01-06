# 🚀 Railway 自动部署配置指南

## ✅ 已完成的配置

项目已经准备好 Railway 部署：

### 配置文件
- ✅ `railway.json` - 根目录配置
- ✅ `backend/railway.json` - 后端服务配置
- ✅ `frontend/railway.json` - 前端服务配置

### 代码配置
- ✅ 后端使用 `process.env.PORT`（Railway 自动注入）
- ✅ 前端支持 `VITE_API_BASE_URL` 环境变量
- ✅ 健康检查接口：`/api/health`

---

## 🎯 Railway 部署步骤

### 步骤 1：在 Railway 中创建服务

#### 1.1 创建 Backend 服务

1. 在 Railway 项目中点击 **"New"** → **"GitHub Repo"**
2. 选择仓库：`penglei-it/low-code-platform`
3. **配置服务**：
   - **Service Name**: `backend` 或 `@low-code-platform/backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Healthcheck Path**: `/api/health`

4. **环境变量**：
   - `NODE_ENV` = `production`
   - `PORT` = `$PORT`（Railway 自动设置，无需手动配置）
   - 如果有数据库：`DATABASE_URL` = Railway 会自动提供

#### 1.2 创建 Frontend 服务

1. 同样方式创建第二个服务
2. **配置服务**：
   - **Service Name**: `frontend` 或 `@low-code-platform/frontend`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npx serve -s dist -p $PORT`
   - **Healthcheck Path**: `/`

3. **环境变量**（重要！）：
   - `VITE_API_BASE_URL` = `https://[backend-service-url]/api`
     - ⚠️ 需要在 Backend 服务启动后获取其 Public Domain
     - 格式：`https://backend-xxxxx.railway.app/api`

---

## 🔧 关键配置说明

### Frontend 环境变量配置

**问题**：前端需要在构建时知道后端地址，但后端地址是部署后才生成的。

**解决方案**：

#### 方法 1：使用 Railway 服务引用（推荐）

Railway 支持服务间引用，配置步骤如下：

1. **先部署 Backend 服务**
   - 等待 Backend 服务成功启动
   - 获取 Backend 的 Public Domain（例如：`https://backend-xxxxx.railway.app`）

2. **配置 Frontend 服务环境变量**
   - 进入 Frontend 服务 → **Settings** → **Variables**
   - 添加：`VITE_API_BASE_URL` = `https://backend-xxxxx.railway.app/api`
   - 保存后会自动重新构建和部署

#### 方法 2：使用 Railway Private Networking

Railway 服务之间可以使用私有网络通信：

1. **Backend 服务**：
   - 获取 Backend 的 **Private Domain**（格式：`backend.railway.internal`）

2. **Frontend 环境变量**：
   - `VITE_API_BASE_URL` = `http://backend.railway.internal/api`
   - ⚠️ 注意：这要求前端也在 Railway 上，且使用 HTTP（不是 HTTPS）

#### 方法 3：使用相对路径（最简单）

如果前端和后端在同一域名下：

1. 不需要设置 `VITE_API_BASE_URL`
2. 前端代码会使用默认值 `/api`
3. 需要在 Railway 中配置路由，将 `/api/*` 转发到 Backend 服务

---

## 📋 部署检查清单

### Backend 服务检查

- [ ] Root Directory 设置为 `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] Healthcheck Path: `/api/health`
- [ ] 环境变量 `NODE_ENV` = `production`
- [ ] 日志显示 "Server is running" 且状态为 "Running"

### Frontend 服务检查

- [ ] Root Directory 设置为 `frontend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npx serve -s dist -p $PORT`
- [ ] Healthcheck Path: `/`
- [ ] 环境变量 `VITE_API_BASE_URL` 已设置（指向后端）
- [ ] 日志显示服务启动成功且状态为 "Running"

---

## 🔍 故障排查

### 问题 1：Backend 服务无法启动

**检查**：
- 查看日志是否有错误
- 确认 `backend/dist/index.js` 文件存在（构建成功）
- 确认端口使用 `process.env.PORT`

**常见错误**：
- ❌ `Cannot find module` → 检查依赖是否安装
- ❌ `Port already in use` → 确保使用 `$PORT`
- ❌ `Database connection failed` → 检查数据库配置

### 问题 2：Frontend 服务无法启动

**检查**：
- 确认 `frontend/dist` 目录存在（构建成功）
- 确认 `serve` 依赖已安装
- 查看日志错误信息

**常见错误**：
- ❌ `dist directory not found` → 构建失败，检查构建日志
- ❌ `serve not found` → 需要添加 `serve` 到 dependencies

### 问题 3：前端无法连接后端

**检查**：
- `VITE_API_BASE_URL` 是否正确设置
- Backend 服务是否正常运行
- 检查浏览器控制台的网络请求

**解决方案**：
- 确保 `VITE_API_BASE_URL` 格式正确：`https://backend-xxxxx.railway.app/api`
- 确认后端 CORS 配置允许前端域名

---

## 🎯 快速部署步骤总结

1. **部署 Backend**：
   - 创建服务，Root Directory = `backend`
   - 等待启动成功，获取 Public Domain

2. **部署 Frontend**：
   - 创建服务，Root Directory = `frontend`
   - 设置环境变量：`VITE_API_BASE_URL` = `https://[backend-domain]/api`
   - 等待构建和启动完成

3. **测试**：
   - 访问前端 Public Domain
   - 检查浏览器控制台是否有 API 请求错误
   - 测试应用功能

---

## 📞 获取帮助

如果遇到问题：
1. 查看服务日志找出具体错误
2. 参考 `Railway问题解决指南.md`
3. 检查 `检查Railway部署状态并获取访问地址.md`

---

**配置完成后，Railway 会自动检测 GitHub 推送并重新部署！** 🚀

