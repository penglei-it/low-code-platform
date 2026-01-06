@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo 一键部署到 Railway
echo ====================================
echo.

echo Railway 是一个优秀的全栈部署平台：
echo   ✓ $5 免费额度/月（足够小型项目）
echo   ✓ 支持数据库（PostgreSQL, MySQL, Redis）
echo   ✓ 自动 HTTPS
echo   ✓ 环境变量管理
echo   ✓ 自动部署（连接 GitHub）
echo.

echo [步骤 1] 检查后端构建...
cd backend
if not exist dist\index.js (
    echo ⚠️  后端未构建，正在构建...
    call npm run build
    if errorlevel 1 (
        echo ❌ 后端构建失败
        pause
        exit /b 1
    )
    echo ✓ 后端构建完成
) else (
    echo ✓ 后端已构建
)
cd ..

echo.
echo [步骤 2] 检查前端构建...
cd frontend
if not exist dist\index.html (
    echo ⚠️  前端未构建，正在构建...
    call npm run build
    if errorlevel 1 (
        echo ❌ 前端构建失败
        pause
        exit /b 1
    )
    echo ✓ 前端构建完成
) else (
    echo ✓ 前端已构建
)
cd ..

echo.
echo ====================================
echo Railway 部署步骤
echo ====================================
echo.

echo [步骤 3] 打开 Railway 部署指南...
echo.
echo 请按照以下步骤操作：
echo.
echo 1. 访问 https://railway.app
echo 2. 点击 "Login" 或 "Sign Up"
echo 3. 使用 GitHub 账号登录（推荐）
echo 4. 点击 "New Project"
echo 5. 选择 "Deploy from GitHub repo"
echo 6. 选择您的仓库
echo.
echo 然后选择部署方式：
echo   A. 部署后端服务
echo   B. 部署前端服务
echo   C. 同时部署前后端
echo.
set /p DEPLOY_MODE="请选择 (A/B/C): "

if /i "%DEPLOY_MODE%"=="A" goto :deploy_backend
if /i "%DEPLOY_MODE%"=="B" goto :deploy_frontend
if /i "%DEPLOY_MODE%"=="C" goto :deploy_both

:deploy_backend
echo.
echo ====================================
echo 部署后端到 Railway
echo ====================================
echo.
echo 配置说明：
echo.
echo Root Directory: backend
echo Build Command: npm install ^&^& npm run build
echo Start Command: npm start
echo.
echo 环境变量（在 Railway 项目设置中添加）：
echo   NODE_ENV=production
echo   PORT=3001（可选，Railway 会自动分配）
echo   DATABASE_URL=（如果需要数据库）
echo.
echo 等待部署完成（约 2-5 分钟）
echo 部署完成后会获得访问地址
echo.
goto :open_railway

:deploy_frontend
echo.
echo ====================================
echo 部署前端到 Railway
echo ====================================
echo.
echo 配置说明：
echo.
echo Root Directory: frontend
echo Build Command: npm install ^&^& npm run build
echo Start Command: npx serve -s dist -p $PORT
echo.
echo 环境变量（在 Railway 项目设置中添加）：
echo   VITE_API_BASE_URL=https://your-backend.railway.app/api
echo.
echo 等待部署完成（约 2-5 分钟）
echo 部署完成后会获得访问地址
echo.
goto :open_railway

:deploy_both
echo.
echo ====================================
echo 同时部署前后端到 Railway
echo ====================================
echo.
echo 步骤：
echo.
echo 1. 首先部署后端服务
echo    Root Directory: backend
echo    Build: npm install ^&^& npm run build
echo    Start: npm start
echo.
echo 2. 等待后端部署完成，获取后端地址
echo.
echo 3. 然后部署前端服务
echo    Root Directory: frontend
echo    Build: npm install ^&^& npm run build
echo    Start: npx serve -s dist -p $PORT
echo.
echo 4. 在前端服务中添加环境变量：
echo    VITE_API_BASE_URL=https://your-backend.railway.app/api
echo.
echo 5. 重新部署前端
echo.
goto :open_railway

:open_railway
echo.
echo ====================================
echo 正在打开 Railway...
echo ====================================
echo.
start https://railway.app

echo.
echo 提示：
echo   1. 如果还未登录，请先登录 Railway
echo   2. 详细配置说明请查看：部署到Railway.md
echo   3. 部署完成后，记得配置环境变量
echo   4. 如果需要帮助，查看 Railway 部署指南
echo.
pause

endlocal

