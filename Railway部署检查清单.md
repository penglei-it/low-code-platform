# ✅ Railway 部署检查清单

使用此清单确保部署成功。

## 📋 部署前准备

### 代码准备

- [ ] Git 仓库已初始化
- [ ] 代码已提交到本地仓库
- [ ] 代码已推送到 GitHub
- [ ] 后端构建成功（`backend/dist/index.js` 存在）
- [ ] 前端构建成功（`frontend/dist/index.html` 存在）

### Railway 准备

- [ ] 已注册 Railway 账号（https://railway.app）
- [ ] 已使用 GitHub 账号登录
- [ ] Railway 已授权访问 GitHub

## 🚀 部署步骤

### 步骤 1：创建项目

- [ ] 点击 "New Project"
- [ ] 选择 "Deploy from GitHub repo"
- [ ] 选择您的仓库
- [ ] 项目创建成功

### 步骤 2：部署后端

- [ ] 点击后端服务（或添加新服务）
- [ ] 选择 "GitHub Repo"
- [ ] 配置：
  - [ ] Root Directory: `backend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npm start`
- [ ] 等待部署完成（2-5分钟）
- [ ] 后端部署成功，没有错误
- [ ] 获取后端地址：
  - [ ] 点击服务
  - [ ] Settings → Networking
  - [ ] 找到 Public Domain
  - [ ] 复制地址（例如：`https://xxx.railway.app`）

### 步骤 3：部署前端

- [ ] 在同一项目中点击 "+ New" → "GitHub Repo"
- [ ] 选择相同仓库
- [ ] 配置：
  - [ ] Root Directory: `frontend`
  - [ ] Build Command: `npm install && npm run build`
  - [ ] Start Command: `npx serve -s dist -p $PORT`
- [ ] 添加环境变量：
  - [ ] 点击服务 → Variables
  - [ ] 添加：`VITE_API_BASE_URL` = `https://后端地址/api`
- [ ] 等待部署完成
- [ ] 前端部署成功，没有错误
- [ ] 获取前端地址

### 步骤 4：验证部署

- [ ] 访问前端地址，页面正常加载
- [ ] 检查浏览器控制台，没有错误
- [ ] 测试功能，API 请求正常
- [ ] 访问后端健康检查：`https://后端地址/api/health`
- [ ] 后端返回正常响应

## 🐛 常见问题检查

### 后端问题

- [ ] 构建是否成功？（查看构建日志）
- [ ] 启动命令是否正确？
- [ ] 端口是否使用 `process.env.PORT`？
- [ ] 环境变量是否配置？

### 前端问题

- [ ] 构建是否成功？
- [ ] `VITE_API_BASE_URL` 是否正确设置？
- [ ] 是否重新部署了前端？（环境变量需要重新构建）
- [ ] 后端地址是否可以访问？

### 连接问题

- [ ] 前端是否能访问后端地址？
- [ ] CORS 是否配置正确？
- [ ] 环境变量是否正确？

## ✅ 部署成功标志

当所有以下条件满足时，部署成功：

- ✅ 前端地址可以访问
- ✅ 页面正常加载
- ✅ API 请求正常
- ✅ 后端健康检查返回正常
- ✅ 没有错误日志

---

**完成所有检查项后，部署应该成功！** 🎉

