# 🚀 部署前端到 Vercel（最简单）

## 为什么选择 Vercel？

- ✅ **完全免费**（100GB 带宽/月）
- ✅ **零配置**，上传即用
- ✅ **自动 HTTPS**
- ✅ **全球 CDN** 加速
- ✅ **自定义域名**免费
- ✅ **自动部署**（连接 GitHub）

## 📦 快速部署

### 方式一：使用 Vercel CLI（推荐）

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署前端
cd frontend
vercel --prod

# 完成！会获得类似 https://your-project.vercel.app 的地址
```

### 方式二：连接 GitHub（推荐，支持自动部署）

1. **访问** https://vercel.com，注册/登录账号

2. **点击** "Add New..." → "Project"

3. **连接 GitHub**
   - 选择 "Import Git Repository"
   - 授权 Vercel 访问 GitHub

4. **配置项目**
   - 选择仓库
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **部署**
   - 点击 "Deploy"
   - 等待构建完成
   - 获得访问地址！

## ⚙️ 配置环境变量

如果需要设置 API 地址：

1. 在 Vercel 项目设置中
2. 进入 "Environment Variables"
3. 添加：`VITE_API_BASE_URL` = `https://your-backend-url.com/api`
4. 重新部署

## 🔗 连接后端

如果后端部署在其他平台（如 Railway）：

```bash
# 在 Vercel 环境变量中设置
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

## 📝 后续更新

**使用 GitHub 连接**：
- 只需推送代码到 GitHub
- Vercel 会自动部署

**使用 CLI**：
```bash
cd frontend
vercel --prod
```

## ✅ 部署完成

部署成功后：
- 获得：`https://your-project.vercel.app`
- 可以配置自定义域名
- 自动 HTTPS 和 CDN 加速

---

**这是最简单的免费部署方案！** 🎉

