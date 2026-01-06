@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ====================================
echo Railway 自动化部署
echo ====================================
echo.

set ERRORS=0

:: 1. 检查 Git 仓库
echo [1/6] 检查 Git 仓库...
git status >nul 2>&1
if errorlevel 1 (
    echo ⚠️  未检测到 Git 仓库
    echo 正在初始化 Git 仓库...
    git init
    echo.
    echo 请先配置 Git 并推送到 GitHub：
    echo   git remote add origin https://github.com/your-username/your-repo.git
    echo   git add .
    echo   git commit -m "Initial commit"
    echo   git push -u origin main
    echo.
    set /a ERRORS+=1
    goto :error_check
) else (
    echo ✓ Git 仓库已初始化
)

:: 2. 检查后端构建
echo.
echo [2/6] 检查后端构建...
cd backend
if not exist dist\index.js (
    echo 正在构建后端...
    call npm run build
    if errorlevel 1 (
        echo ❌ 后端构建失败
        set /a ERRORS+=1
        cd ..
        goto :error_check
    )
    echo ✓ 后端构建完成
)
cd ..

:: 3. 检查前端构建
echo.
echo [3/6] 检查前端构建...
cd frontend
if not exist dist\index.html (
    echo 正在构建前端...
    call npm run build
    if errorlevel 1 (
        echo ❌ 前端构建失败
        set /a ERRORS+=1
        cd ..
        goto :error_check
    )
    echo ✓ 前端构建完成
)
cd ..

:: 4. 检查 Railway 配置文件
echo.
echo [4/6] 检查 Railway 配置文件...
if exist railway.json (
    echo ✓ railway.json 已存在
) else (
    echo ✓ 已创建 railway.json（可选）
)

if exist backend\railway.json (
    echo ✓ backend/railway.json 已存在
) else (
    echo ✓ 已创建 backend/railway.json
)

if exist frontend\railway.json (
    echo ✓ frontend/railway.json 已存在
) else (
    echo ✓ 已创建 frontend/railway.json
)

:: 5. 检查 package.json
echo.
echo [5/6] 检查配置文件...
if exist backend\package.json (
    echo ✓ backend/package.json 存在
) else (
    echo ❌ backend/package.json 不存在
    set /a ERRORS+=1
)

if exist frontend\package.json (
    echo ✓ frontend/package.json 存在
) else (
    echo ❌ frontend/package.json 不存在
    set /a ERRORS+=1
)

:: 6. 生成部署说明
echo.
echo [6/6] 生成部署说明...
echo ✓ 准备完成

:error_check
echo.
echo ====================================
if %ERRORS%==0 (
    echo ✓ 所有检查通过，可以开始部署
    echo ====================================
    echo.
    echo 下一步操作：
    echo.
    echo 1. 确保代码已推送到 GitHub
    echo    git add .
    echo    git commit -m "准备部署到 Railway"
    echo    git push
    echo.
    echo 2. 访问 https://railway.app
    echo    使用 GitHub 账号登录
    echo.
    echo 3. 点击 "New Project" → "Deploy from GitHub repo"
    echo    选择您的仓库
    echo.
    echo 4. 部署后端服务：
    echo    - Root Directory: backend
    echo    - Build Command: npm install ^&^& npm run build
    echo    - Start Command: npm start
    echo.
    echo 5. 等待后端部署完成，获取后端地址
    echo.
    echo 6. 在同一项目中添加前端服务：
    echo    - Root Directory: frontend
    echo    - Build Command: npm install ^&^& npm run build
    echo    - Start Command: npx serve -s dist -p $PORT
    echo    - 环境变量: VITE_API_BASE_URL=https://后端地址/api
    echo.
    echo 7. 等待部署完成，获得访问地址
    echo.
    echo 详细步骤请查看：Railway部署完整指南.md
    echo.
    echo 按任意键打开 Railway...
    pause >nul
    start https://railway.app
) else (
    echo ⚠️  发现 %ERRORS% 个问题，请先修复
    echo ====================================
    echo.
    echo 请根据上方提示修复问题后重新运行此脚本
    echo.
)

pause
endlocal

