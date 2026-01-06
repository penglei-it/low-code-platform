# 🚂 Railway 部署完整指南

## 📋 Railway 简介

Railway 是一个现代化的全栈应用部署平台，特别适合 Node.js 应用。

### 优点

- ✅ **$5 免费额度/月**（足够小型项目）
- ✅ **支持数据库**（PostgreSQL, MySQL, Redis, MongoDB）
- ✅ **自动 HTTPS**
- ✅ **环境变量管理**
- ✅ **Docker 支持**
- ✅ **自动部署**（连接 GitHub）
- ✅ **监控和日志**

### 费用

- **免费额度**：$5/月
- **通常足够**：
  - 1-2 个小应用
  - 小型数据库
  - 低到中等流量

---

## 🚀 快速部署

### 方式一：Web 界面部署（推荐）

#### 步骤 1：注册并登录

1. 访问 https://railway.app
2. 点击 **"Login"** 或 **"Sign Up"**
3. 选择 **"Login with GitHub"**（推荐）
4. 授权 Railway 访问 GitHub

#### 步骤 2：创建项目

1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择您的仓库
4. 点击 **"Deploy Now"**

#### 步骤 3：配置服务

Railway 会自动检测您的项目，您需要：

1. **选择服务类型**
   - 如果检测到多个服务，需要分别配置
   - 或者创建一个项目，然后添加多个服务

2. **配置后端服务**
   - 点击服务或 **"Add Service"**
   - 选择 **"GitHub Repo"**
   - 配置：
     - **Root Directory**: `backend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npm start`
     - **Port**: Railway 会自动检测或使用环境变量

3. **配置前端服务**
   - 再次点击 **"Add Service"**
   - 选择 **"GitHub Repo"**
   - 配置：
     - **Root Directory**: `frontend`
     - **Build Command**: `npm install && npm run build`
     - **Start Command**: `npx serve -s dist -p $PORT`
     - **Port**: Railway 会自动分配

#### 步骤 4：配置环境变量

在服务设置中 → **Variables**：

**后端环境变量**：
```
NODE_ENV=production
PORT=3001
DATABASE_URL=<如果需要数据库>
```

**前端环境变量**：
```
VITE_API_BASE_URL=https://your-backend-service.railway.app/api
```

**获取后端地址**：
1. 等待后端部署完成
2. 点击后端服务
3. 在 **"Settings"** → **"Networking"** 中
4. 找到 **"Public Domain"**
5. 复制地址，用于前端环境变量

#### 步骤 5：部署

配置完成后：
1. Railway 会自动开始构建和部署
2. 等待约 2-5 分钟
3. 部署完成后会获得访问地址

---

### 方式二：使用 Railway CLI

#### 安装 CLI

```bash
# Windows
npm install -g @railway/cli

# 或使用 Scoop
scoop install railway
```

#### 登录

```bash
railway login
```

#### 初始化项目

```bash
cd backend
railway init
```

#### 部署

```bash
railway up
```

---

## 📦 部署后端服务

### 配置说明

| 配置项 | 值 |
|--------|-----|
| Root Directory | `backend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npm start` |
| Port | Railway 自动分配（通过 `$PORT` 环境变量） |

### 环境变量

```
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
DATABASE_URL=<如果需要数据库>
```

### 修改后端代码（如果需要）

Railway 会自动注入 `$PORT` 环境变量，确保您的代码使用：

```typescript
const PORT = process.env.PORT || 3001;
```

---

## 🎨 部署前端服务

### 配置说明

| 配置项 | 值 |
|--------|-----|
| Root Directory | `frontend` |
| Build Command | `npm install && npm run build` |
| Start Command | `npx serve -s dist -p $PORT` |
| Port | Railway 自动分配 |

### 环境变量

```
VITE_API_BASE_URL=https://your-backend-service.railway.app/api
```

**注意**：Vite 环境变量需要在构建时设置，所以：
1. 在 Railway 中设置环境变量
2. 重新部署前端（Railway 会自动重新构建）

### 安装 serve（如果需要）

前端服务的 `Start Command` 使用 `npx serve`，这会在部署时自动安装。

如果想在本地测试：
```bash
npm install -g serve
serve -s dist -p 4173
```

---

## 🗄️ 添加数据库（可选）

### 步骤

1. 在 Railway 项目中点击 **"+ New"**
2. 选择 **"Database"**
3. 选择数据库类型：
   - **PostgreSQL**（推荐）
   - **MySQL**
   - **Redis**
   - **MongoDB**

4. Railway 会自动创建并提供连接字符串
5. 在服务环境变量中使用：
   ```
   DATABASE_URL=<Railway 提供的连接字符串>
   ```

### 使用 Prisma（如果使用）

Railway 提供的数据库 URL 可以直接用于 Prisma：

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
```

在 Railway 部署时运行迁移：
- 在 **"Settings"** → **"Deploy"** 中
- 添加 **"Deploy Command"**: `npx prisma migrate deploy && npm start`

---

## ⚙️ 环境变量管理

### 在 Railway 中设置

1. 点击服务
2. 进入 **"Variables"** 标签
3. 点击 **"+ New Variable"**
4. 添加变量名和值
5. 保存后会自动重新部署

### 环境变量优先级

1. Railway 环境变量
2. `.env` 文件
3. 代码默认值

---

## 🔄 自动部署

### 连接 GitHub

Railway 支持自动部署：
1. 推送代码到 GitHub
2. Railway 自动检测更改
3. 自动重新构建和部署

### 禁用自动部署

在服务设置 → **"Deploy"** → **"Auto Deploy"** 中可以禁用。

---

## 📊 监控和日志

### 查看日志

1. 点击服务
2. 进入 **"Deployments"** 标签
3. 点击部署记录
4. 查看构建和运行日志

### 监控指标

Railway 提供：
- CPU 使用率
- 内存使用率
- 网络流量
- 请求数

---

## 🔗 获取访问地址

### 临时域名

Railway 会自动提供：
- 格式：`https://your-service.railway.app`
- 自动 HTTPS

### 自定义域名

1. 在服务设置 → **"Networking"**
2. 点击 **"Custom Domain"**
3. 添加您的域名
4. 配置 DNS（Railway 会提供说明）

---

## 🐛 常见问题

### 1. 构建失败

**检查**：
- 构建命令是否正确
- 依赖是否完整
- Node.js 版本是否兼容

**解决**：
- 在 `package.json` 中指定 Node 版本
- 检查构建日志

### 2. 服务启动失败

**检查**：
- Start Command 是否正确
- 端口是否使用 `$PORT` 环境变量
- 环境变量是否配置完整

**解决**：
- 查看运行日志
- 确保代码中使用了 `process.env.PORT`

### 3. 前端无法连接后端

**检查**：
- `VITE_API_BASE_URL` 是否正确设置
- 后端地址是否正确
- CORS 是否配置

**解决**：
- 重新构建前端（环境变量需要在构建时设置）
- 检查后端 CORS 配置

### 4. 数据库连接失败

**检查**：
- `DATABASE_URL` 是否正确
- 数据库服务是否运行
- 网络连接是否正常

**解决**：
- 在 Railway 中检查数据库状态
- 验证连接字符串

---

## 📝 最佳实践

### 1. 环境变量

- ✅ 使用 Railway 的环境变量功能
- ✅ 不要提交敏感信息到代码仓库
- ✅ 使用 `.env.example` 作为模板

### 2. 构建优化

- ✅ 使用生产环境构建命令
- ✅ 优化依赖安装（使用 `npm ci`）
- ✅ 清理不必要的文件

### 3. 监控

- ✅ 定期检查日志
- ✅ 监控资源使用
- ✅ 设置告警（如果需要）

---

## 🎯 完整部署流程

### 第一次部署

1. **准备代码**
   ```bash
   # 确保代码已提交到 GitHub
   git add .
   git commit -m "准备部署到 Railway"
   git push
   ```

2. **部署后端**
   - 访问 railway.app
   - 创建项目 → 部署后端服务
   - 等待部署完成
   - 获取后端地址

3. **部署前端**
   - 添加前端服务
   - 配置环境变量（使用后端地址）
   - 等待部署完成

4. **测试**
   - 访问前端地址
   - 测试 API 连接
   - 检查功能是否正常

### 后续更新

只需推送代码到 GitHub，Railway 会自动部署！

---

## 📚 相关资源

- Railway 官网：https://railway.app
- Railway 文档：https://docs.railway.app
- Railway Discord：https://discord.gg/railway

---

**现在运行 `一键部署到Railway.bat` 开始部署！** 🚂

