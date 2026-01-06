# 🚂 部署后端到 Railway

## 为什么选择 Railway？

- ✅ **$5 免费额度/月**（足够小型项目）
- ✅ **支持数据库**（PostgreSQL, MySQL, Redis）
- ✅ **自动 HTTPS**
- ✅ **环境变量管理**
- ✅ **Docker 支持**
- ✅ **自动部署**（GitHub）

## 📦 部署步骤

### 1. 注册 Railway

1. 访问 https://railway.app
2. 点击 "Login" 或 "Sign Up"
3. 使用 GitHub 账号登录（推荐）

### 2. 创建项目

1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择您的仓库
4. 点击 **"Deploy Now"**

### 3. 配置后端服务

1. **选择服务**
   - Railway 会自动检测，选择 `backend` 目录

2. **配置构建和启动**
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

3. **环境变量**
   - `PORT`: `3001`（可选，Railway 会自动分配）
   - `NODE_ENV`: `production`
   - `DATABASE_URL`: 如果需要数据库

4. **等待部署**
   - Railway 会自动构建和部署
   - 等待约 2-5 分钟

### 4. 获取访问地址

部署完成后：
1. 点击服务
2. 在 "Settings" → "Networking" 中
3. 找到 "Public Domain"
4. 获得类似：`https://your-backend.railway.app`

## 🔗 连接数据库（可选）

如果需要数据库：

1. 在项目中点击 **"+ New"** → **"Database"**
2. 选择 **PostgreSQL** 或 **MySQL**
3. Railway 会自动创建并提供连接字符串
4. 在环境变量中使用 `DATABASE_URL`

## ⚙️ 环境变量配置

在 Railway 项目设置中配置：

```
NODE_ENV=production
PORT=3001
DATABASE_URL=<Railway 提供的数据库 URL>
```

## 📝 更新部署

**自动部署**：
- 推送代码到 GitHub
- Railway 会自动检测并重新部署

**手动部署**：
- 在 Railway Dashboard 中点击 "Redeploy"

## ✅ 部署完成

部署成功后：
- 后端 API 地址：`https://your-backend.railway.app`
- 健康检查：`https://your-backend.railway.app/api/health`
- 自动 HTTPS
- 可以配置自定义域名

## 💰 费用说明

- **免费额度**：$5/月
- 通常足够：
  - 1-2 个小应用
  - 小型数据库
  - 低流量使用

超过免费额度会要求添加支付方式，但通常不会产生费用。

---

**Railway 是部署后端的最佳选择之一！** 🚂

