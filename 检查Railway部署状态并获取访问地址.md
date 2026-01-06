# 🔍 Railway 部署状态检查与访问地址获取

## 📊 当前状态分析

从您的 Railway 界面看到：
- ✅ 服务已创建：`@low-code-platform/frontend` 和 `@low-code-platform/backend`
- ❌ **服务状态**：`Service is offline`（服务离线）

## 🔧 解决步骤

### 步骤 1：检查服务日志

1. 在 Railway 界面中，点击左侧的 **"Logs"** 标签
2. 查看两个服务的日志：
   - 点击 `@low-code-platform/frontend` 服务 → 查看日志
   - 点击 `@low-code-platform/backend` 服务 → 查看日志

**常见问题**：
- 🔴 **构建失败**：检查构建日志中的错误信息
- 🔴 **启动失败**：检查运行时错误
- 🔴 **端口配置错误**：确保服务监听 `$PORT` 环境变量
- 🔴 **依赖安装失败**：检查 package.json 配置

### 步骤 2：获取访问地址

**方法 A：从服务设置中获取**

1. 点击服务（frontend 或 backend）
2. 进入 **"Settings"** 标签
3. 在 **"Networking"** 或 **"Domains"** 部分：
   - 查看 **Public Domain**（公共域名）
   - 如果没有，点击 **"Generate Domain"** 生成一个

**方法 B：从服务卡片中查看**

1. 在 Architecture 视图中，点击服务卡片
2. 在服务详情页面查看 **"Public Domain"** 或 **"Endpoint"**

### 步骤 3：检查服务配置

**Frontend 服务配置**：
- **Root Directory**: `frontend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npx serve -s dist -p $PORT`
- **Environment Variables**:
  - `VITE_API_BASE_URL`: 设置为 backend 服务的公共域名

**Backend 服务配置**：
- **Root Directory**: `backend`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`
- **Environment Variables**:
  - `PORT`: Railway 会自动设置（使用 `$PORT`）
  - `NODE_ENV`: `production`
  - `DATABASE_URL`: 如果有数据库，Railway 会自动提供

### 步骤 4：重启服务

如果服务处于离线状态：

1. 点击服务
2. 进入 **"Settings"** 标签
3. 点击 **"Redeploy"** 或 **"Restart"** 按钮

---

## 📋 故障排查清单

### ✅ 检查清单

- [ ] 查看日志是否有错误
- [ ] 检查服务是否在构建（Building）
- [ ] 确认服务配置正确（Root Directory、Build Command、Start Command）
- [ ] 检查环境变量是否配置
- [ ] 确认端口使用 `$PORT`（Railway 要求）
- [ ] 检查前端 API 地址是否正确指向后端
- [ ] 验证数据库连接（如果使用）

### 🔴 常见错误及解决方案

#### 1. 构建失败（Build Failed）

**可能原因**：
- 依赖安装失败
- TypeScript 编译错误
- 构建脚本错误

**解决**：
- 检查 `package.json` 中的 `build` 脚本
- 查看构建日志中的具体错误
- 确保所有依赖都在 `dependencies` 中（不是 `devDependencies`）

#### 2. 服务启动失败（Service Crashed）

**可能原因**：
- 端口配置错误（未使用 `$PORT`）
- 数据库连接失败
- 缺少必需的环境变量

**解决**：
- 确保代码中使用 `process.env.PORT` 或 `$PORT`
- 检查环境变量配置
- 查看运行时日志

#### 3. 404 错误（页面无法访问）

**可能原因**：
- 前端路由配置问题
- 静态文件服务配置错误
- API 地址配置错误

**解决**：
- 检查 `vite.config.ts` 中的 `base` 配置
- 确认 `VITE_API_BASE_URL` 环境变量正确
- 检查 `serve` 命令的参数

---

## 🌐 访问地址格式

Railway 生成的访问地址格式通常为：
- `https://[服务名]-[随机字符].railway.app`
- 或自定义域名

**前端地址示例**：
```
https://frontend-xxxxx.railway.app
```

**后端地址示例**：
```
https://backend-xxxxx.railway.app
```

---

## 🎯 快速操作步骤

1. **查看日志** → 点击 "Logs" 标签
2. **检查错误** → 根据错误信息修复
3. **获取地址** → 在服务 Settings 中查看 Public Domain
4. **重启服务** → 点击 Redeploy
5. **访问测试** → 使用生成的域名访问

---

## 📞 需要帮助？

如果问题仍未解决：
1. 复制完整的错误日志
2. 检查服务配置截图
3. 查看 `Railway问题解决指南.md` 获取更多帮助

