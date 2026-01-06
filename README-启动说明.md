# 项目启动说明

## 问题排查

如果网页打不开，请按以下步骤排查：

### 1. 检查依赖是否安装完成

```bash
# 检查前端依赖
cd frontend
dir node_modules

# 检查后端依赖
cd ../backend
dir node_modules
```

如果 `node_modules` 目录不存在或为空，需要先安装依赖：

```bash
# 在项目根目录执行
npm install

# 或分别安装
cd frontend && npm install
cd ../backend && npm install
```

### 2. 手动启动服务

#### 方式一：使用启动脚本（推荐）
双击运行 `启动项目.bat` 文件

#### 方式二：手动启动

**终端1 - 启动后端：**
```bash
cd backend
npm run dev
```

**终端2 - 启动前端：**
```bash
cd frontend
npm run dev
```

### 3. 检查服务是否运行

打开浏览器访问：
- 前端: http://localhost:3000
- 后端健康检查: http://localhost:3001/api/health

### 4. 常见问题

#### 端口被占用
如果端口3000或3001被占用，可以：
1. 关闭占用端口的程序
2. 或修改 `frontend/vite.config.ts` 和 `backend/src/index.ts` 中的端口号

#### 依赖安装失败
- 检查网络连接
- 尝试使用国内镜像：`npm install --registry=https://registry.npmmirror.com`
- 清除缓存：`npm cache clean --force`

#### 服务启动失败
- 检查Node.js版本（需要 >= 18.0.0）
- 查看终端错误信息
- 检查 `package.json` 中的脚本配置

### 5. 验证服务状态

```bash
# 检查端口监听
netstat -ano | findstr ":3000 :3001"

# 检查进程
tasklist | findstr node
```

## 快速启动

最简单的方式：双击 `启动项目.bat` 文件，脚本会自动：
1. 检查Node.js
2. 安装依赖（如果需要）
3. 启动后端服务
4. 启动前端服务

然后访问 http://localhost:3000

