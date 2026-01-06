# 🚂 Railway 快速开始

## 5 分钟快速部署

### 步骤 1：注册 Railway

1. 访问 https://railway.app
2. 使用 GitHub 账号登录

### 步骤 2：部署后端

1. 点击 **"New Project"**
2. 选择 **"Deploy from GitHub repo"**
3. 选择您的仓库
4. Railway 自动检测，点击后端服务
5. 配置：
   - **Root Directory**: `backend`
   - **Build**: `npm install && npm run build`
   - **Start**: `npm start`
6. 等待部署（2-5分钟）
7. 获取后端地址：`https://xxx.railway.app`

### 步骤 3：部署前端

1. 在同一个项目中点击 **"+ New"** → **"GitHub Repo"**
2. 选择相同的仓库
3. 配置：
   - **Root Directory**: `frontend`
   - **Build**: `npm install && npm run build`
   - **Start**: `npx serve -s dist -p $PORT`
4. 添加环境变量：
   - `VITE_API_BASE_URL` = 后端地址 + `/api`
5. 等待部署完成

### 步骤 4：测试

- 访问前端地址
- 测试功能

**完成！** 🎉

---

## 配置参考

### 后端配置

```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
Port: 自动分配
```

**环境变量**：
```
NODE_ENV=production
```

### 前端配置

```
Root Directory: frontend
Build Command: npm install && npm run build
Start Command: npx serve -s dist -p $PORT
Port: 自动分配
```

**环境变量**：
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

---

## 常见问题

**Q: 如何获取后端地址？**
A: 后端部署完成后，在服务设置 → Networking → Public Domain

**Q: 前端无法连接后端？**
A: 确保 `VITE_API_BASE_URL` 正确设置，并重新部署前端

**Q: 服务启动失败？**
A: 检查日志，确保 Start Command 正确，端口使用 `$PORT`

---

**详细说明请查看：Railway部署完整指南.md**

