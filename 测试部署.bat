@echo off
chcp 65001 >nul
echo ====================================
echo 低代码平台 - 部署测试脚本
echo ====================================
echo.

echo [1/4] 检查构建产物...
if not exist backend\dist (
    echo ❌ 后端未构建，正在构建...
    cd backend
    call npm run build
    if errorlevel 1 (
        echo ❌ 后端构建失败
        pause
        exit /b 1
    )
    cd ..
)
echo ✓ 后端构建产物存在

if not exist frontend\dist (
    echo ❌ 前端未构建，正在构建...
    cd frontend
    call npm run build
    if errorlevel 1 (
        echo ❌ 前端构建失败
        pause
        exit /b 1
    )
    cd ..
)
echo ✓ 前端构建产物存在

echo.
echo [2/4] 检查数据库...
cd backend
if not exist prisma\dev.db (
    echo ⚠️  数据库不存在，正在初始化...
    call npx prisma generate
    call npx prisma migrate dev --name init
    if errorlevel 1 (
        echo ⚠️  数据库初始化失败，但将继续启动
    )
)
cd ..
echo ✓ 数据库检查完成

echo.
echo [3/4] 启动后端服务...
cd backend
start "后端服务-生产环境" cmd /k "npm start"
timeout /t 3 /nobreak >nul

echo.
echo [4/4] 启动前端预览服务...
cd ..\frontend
start "前端预览-生产环境" cmd /k "npm run preview -- --host 0.0.0.0"
timeout /t 2 /nobreak >nul

cd ..
echo.
echo ====================================
echo ✓ 服务启动完成！
echo ====================================
echo.
echo 前端地址: http://localhost:4173
echo 后端地址: http://localhost:3001
echo.
echo 提示: 使用 ipconfig 查看本机 IP，其他设备可通过 http://<本机IP>:4173 访问
echo.
pause

