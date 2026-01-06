# 🔧 Railway 部署问题解决指南

## 常见问题及解决方案

### 1. 构建失败

#### 问题：Build failed

**可能原因**：
- 依赖安装失败
- 构建命令错误
- Node.js 版本不兼容

**解决方案**：

1. **检查构建日志**
   - 在 Railway Dashboard 中查看部署日志
   - 找到错误信息

2. **检查 package.json**
   - 确保所有依赖正确
   - 确保构建脚本存在

3. **指定 Node.js 版本**
   在 `package.json` 中添加：
   ```json
   {
     "engines": {
       "node": ">=18.0.0"
     }
   }
   ```

4. **检查构建命令**
   - 后端：`npm install && npm run build`
   - 前端：`npm install && npm run build`

---

### 2. 服务启动失败

#### 问题：Service failed to start

**可能原因**：
- 启动命令错误
- 端口配置错误
- 缺少环境变量

**解决方案**：

1. **检查启动命令**
   - 后端：`npm start`
   - 前端：`npx serve -s dist -p $PORT`

2. **确保使用 $PORT**
   ```typescript
   // backend/src/index.ts
   const PORT = process.env.PORT || 3001;
   ```

3. **检查环境变量**
   - 在 Railway 服务设置中检查
   - 确保必需的环境变量已设置

---

### 3. 前端无法连接后端

#### 问题：API requests fail

**可能原因**：
- `VITE_API_BASE_URL` 未设置
- 环境变量未在构建时设置
- 后端地址错误

**解决方案**：

1. **设置环境变量**
   - 在 Railway 前端服务设置中
   - 添加：`VITE_API_BASE_URL` = `https://后端地址/api`

2. **重新部署前端**
   - Vite 环境变量需要在构建时设置
   - 设置环境变量后必须重新部署

3. **验证后端地址**
   - 访问后端健康检查：`https://后端地址/api/health`
   - 应该返回正常响应

4. **检查 CORS**
   - 确保后端 CORS 配置允许前端域名

---

### 4. 数据库连接失败

#### 问题：Database connection failed

**可能原因**：
- `DATABASE_URL` 未设置
- 数据库服务未运行
- 连接字符串错误

**解决方案**：

1. **添加数据库**
   - 在 Railway 项目中点击 "+ New" → "Database"
   - 选择数据库类型（PostgreSQL 推荐）

2. **配置环境变量**
   - Railway 会自动提供 `DATABASE_URL`
   - 在服务环境变量中使用

3. **运行迁移**
   - 在部署命令中添加：`npx prisma migrate deploy && npm start`

---

### 5. 端口错误

#### 问题：Port already in use 或 Port binding failed

**可能原因**：
- 未使用 `$PORT` 环境变量
- 硬编码了端口号

**解决方案**：

1. **修改代码使用 $PORT**
   ```typescript
   const PORT = process.env.PORT || 3001;
   ```

2. **确保监听 0.0.0.0**
   ```typescript
   app.listen(PORT, '0.0.0.0', () => {
     console.log(`Server running on port ${PORT}`);
   });
   ```

---

### 6. 环境变量未生效

#### 问题：Environment variables not working

**可能原因**：
- Vite 环境变量需要重新构建
- 环境变量名称错误
- 变量未保存

**解决方案**：

1. **Vite 环境变量**
   - 必须以 `VITE_` 开头
   - 设置后必须重新部署

2. **检查变量名**
   - 前端：`VITE_API_BASE_URL`
   - 后端：`NODE_ENV`, `PORT`, `DATABASE_URL`

3. **重新部署**
   - 修改环境变量后必须重新部署

---

### 7. 部署卡住或超时

#### 问题：Deployment stuck or timeout

**可能原因**：
- 构建时间过长
- 依赖下载慢
- 网络问题

**解决方案**：

1. **检查构建日志**
   - 查看是否在某个步骤卡住

2. **优化构建**
   - 使用 `.npmrc` 配置镜像
   - 减少不必要的依赖

3. **重试部署**
   - 在 Railway Dashboard 中点击 "Redeploy"

---

### 8. 404 错误

#### 问题：404 Not Found

**可能原因**：
- 路由配置错误
- 静态文件路径错误
- 前端路由未配置

**解决方案**：

1. **前端 SPA 路由**
   - 确保使用 `serve` 时支持 SPA
   - 命令：`npx serve -s dist -p $PORT`（-s 表示 SPA 模式）

2. **检查路径**
   - 确保构建输出目录正确

---

## 🔍 调试步骤

### 1. 查看日志

1. 在 Railway Dashboard 中
2. 点击服务
3. 进入 "Deployments" 标签
4. 点击最新的部署
5. 查看构建和运行日志

### 2. 检查配置

1. 检查 Root Directory
2. 检查 Build Command
3. 检查 Start Command
4. 检查环境变量

### 3. 本地测试

在本地模拟 Railway 环境：
```bash
# 后端
PORT=3001 npm start

# 前端
PORT=4173 npx serve -s dist -p 4173
```

---

## 📞 获取帮助

如果问题仍未解决：

1. **查看 Railway 文档**：https://docs.railway.app
2. **Railway Discord**：https://discord.gg/railway
3. **检查日志**：详细错误信息通常在日志中

---

**大多数问题通过检查日志和配置可以解决！** 🔧

