@echo off
chcp 65001 >nul
echo ====================================
echo 低代码平台 - 一键部署脚本
echo ====================================
echo.

:: 构建后端
echo [1/4] 构建后端...
cd backend
call npm run build
if errorlevel 1 (
    echo ❌ 后端构建失败
    pause
    exit /b 1
)
echo ✓ 后端构建完成
cd ..

:: 构建前端
echo.
echo [2/4] 构建前端...
cd frontend
call npm run build
if errorlevel 1 (
    echo ❌ 前端构建失败
    pause
    exit /b 1
)
echo ✓ 前端构建完成
cd ..

:: 检查数据库
echo.
echo [3/4] 检查数据库...
cd backend
if not exist prisma\dev.db (
    echo 正在初始化数据库...
    call npx prisma generate
    call npx prisma migrate dev --name init
)
cd ..
echo ✓ 数据库检查完成

:: 启动服务
echo.
echo [4/4] 启动服务...
echo.
echo 正在启动后端服务（端口 3001）...
echo 注意：请等待后端完全启动后再访问前端
start "后端服务" cmd /k "cd /d %~dp0backend && npm start"

echo 等待后端服务启动...
timeout /t 8 /nobreak >nul

echo 测试后端连接...
powershell -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3001/api/health' -TimeoutSec 3 -UseBasicParsing; Write-Host '✓ 后端服务已就绪' } catch { Write-Host '⚠️  后端服务可能还在启动中，请稍等...' }"

echo.
echo 正在启动前端服务（端口 4173）...
start "前端服务" cmd /k "cd /d %~dp0frontend && npm run preview -- --host 0.0.0.0"
timeout /t 2 /nobreak >nul

echo.
echo ====================================
echo ✓ 部署完成！
echo ====================================
echo.
echo 访问地址：
echo   前端: http://localhost:4173
echo   后端: http://localhost:3001/api/health
echo.
echo 提示：请在新打开的窗口中查看服务启动状态
echo 如果看到错误信息，请检查：
echo   1. 端口是否被占用
echo   2. 数据库是否正确初始化
echo   3. 依赖是否已安装
echo.
echo ====================================
echo 互联网访问说明
echo ====================================
echo.
echo 当前访问方式：
echo   - 本地：http://localhost:4173
echo   - 局域网：http://10.118.39.155:4173（同 WiFi 设备）
echo.
echo 如需让互联网用户访问，请选择：
echo   1. 快速方案：运行 使用ngrok快速部署.bat
echo   2. 查看：互联网访问部署方案.md
echo.
pause

