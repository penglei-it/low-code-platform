@echo off
chcp 65001 >nul
echo ====================================
echo 低代码平台 - 项目启动脚本
echo ====================================
echo.

echo [1/4] 检查Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js未安装，请先安装Node.js
    pause
    exit /b 1
)
echo ✓ Node.js已安装

echo.
echo [2/4] 安装依赖（这可能需要几分钟）...
cd frontend
if not exist node_modules (
    echo 正在安装前端依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 前端依赖安装失败
        pause
        exit /b 1
    )
)
echo ✓ 前端依赖已就绪

cd ..\backend
if not exist node_modules (
    echo 正在安装后端依赖...
    call npm install
    if errorlevel 1 (
        echo ❌ 后端依赖安装失败
        pause
        exit /b 1
    )
)
echo ✓ 后端依赖已就绪

echo.
echo [3/4] 启动后端服务...
cd ..
start "后端服务" cmd /k "cd backend && npm run dev"

echo.
echo [4/4] 启动前端服务...
timeout /t 3 /nobreak >nul
start "前端服务" cmd /k "cd frontend && npm run dev"

echo.
echo ====================================
echo ✓ 服务启动中...
echo ====================================
echo.
echo 前端地址: http://localhost:3000
echo 后端地址: http://localhost:3001
echo.
echo 请等待几秒钟让服务完全启动...
echo 如果浏览器没有自动打开，请手动访问: http://localhost:3000
echo.
pause

